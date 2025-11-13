import { NavigateFunction } from "react-router-dom";
import { OverrideableBuilder } from "supertokens-js-override";

import { ImplType } from "./types";

import { getAccessDeniedEvent } from "@shared/events/accessDenied";
import { HTTPStatusCodes, StorageKeys } from "@shared/constants";
import { HttpMethod } from "@features/auth/types";
import { ForbiddenError } from "@shared/utils/customErrors";

import { ReactComponent as PermissionsIcon } from "@assets/role-nav-icon.svg";
import { ReactComponent as TenantManagementIcon } from "@assets/tenant-nav-icon.svg";
import { ReactComponent as UserManagementIcon } from "@assets/user-nav-icon.svg";

export class Implementation implements ImplType<Implementation> {
	static instance: Implementation | undefined;
	static networkManager:
		| {
				doRequest: (args: {
					url: string;
					method: HttpMethod;
					query?: { [key: string]: string };
					config?: RequestInit;
				}) => Promise<Response>;
		  }
		| undefined;

	static init(config: {
		override?: (
			originalImplementation: Implementation,
			builder: OverrideableBuilder<ImplType<Implementation>>
		) => Implementation;
	}): void {
		if (Implementation.instance) {
			return;
		}

		const implementation = new Implementation();
		const builder = new OverrideableBuilder<ImplType<Implementation>>(implementation);
		if (config.override) {
			builder.override(config.override);
		}
		Implementation.instance = builder.build();
	}

	static getInstanceOrThrow(): Implementation {
		if (!Implementation.instance) {
			throw new Error("Implementation instance not found. Make sure you have initialized the plugin.");
		}

		return Implementation.instance;
	}

	static reset(): void {
		Implementation.instance = undefined;
	}

	constructor() {}

	getLanguage = function (this: Implementation): string {
		return (
			(navigator as any).userLanguage ||
			(navigator.languages && navigator.languages.length && navigator.languages[0]) ||
			navigator.language ||
			(navigator as any).browserLanguage ||
			(navigator as any).systemLanguage ||
			"en"
		);
	};

	getLocalStorageHandler = function (this: Implementation) {
		return {
			getItem: (key: string): string | undefined => {
				const itemFromStorage = window.localStorage.getItem(key);

				return itemFromStorage === null ? undefined : itemFromStorage;
			},
			removeItem: (key: string): void => {
				window.localStorage.removeItem(key);
			},
			setItem: (key: string, value: string) => {
				window.localStorage.setItem(key, value);
			},
		};
	};

	getRequestQueueManager = function (this: Implementation) {
		const requestQueue: { [key: string]: () => Promise<Response> } = {};
		const waiters: { [key: string]: (response: Response) => void } = {};
		let isProcessing = false;

		const processRequest = async () => {
			if (isProcessing) {
				return;
			}

			if (Object.keys(requestQueue).length === 0) {
				return;
			}

			isProcessing = true;
			const requestId = Object.keys(requestQueue)[0];
			const request = requestQueue[requestId];
			const waiter = waiters[requestId];
			delete requestQueue[requestId];
			delete waiters[requestId];

			const response = await request();
			waiter(response);
			isProcessing = false;
			processRequest();
		};

		const addRequestToQueue = (request: () => Promise<Response>, waiter: (response: Response) => void): string => {
			const id = `${Date.now()}.${Math.floor(Math.random() * 1000)}`;
			requestQueue[id] = request;
			waiters[id] = waiter;
			processRequest();
			return id;
		};

		return {
			addRequestToQueue,
			processRequest,
			isProcessing,
			requestQueue,
			waiters,
		};
	};

	getNetworkManager = function (this: Implementation) {
		if (Implementation.networkManager) {
			return Implementation.networkManager;
		}

		const requestQueueManager = this.getRequestQueueManager();

		const doGet = async (url: string, query?: { [key: string]: string }, config?: RequestInit) => {
			const _url: URL = new URL(url);

			// Add query params to URL
			if (query !== undefined) {
				Object.keys(query).forEach((key) => {
					_url.searchParams.append(key, query[key]);
				});
			}

			return fetch(_url, config);
		};

		const doDelete = async (url: string, query?: { [key: string]: string }, config?: RequestInit) => {
			const _url: URL = new URL(url);

			// Add query params to URL
			if (query !== undefined) {
				Object.keys(query).forEach((key) => {
					_url.searchParams.append(key, query[key]);
				});
			}

			return fetch(_url, {
				...config,
				method: "DELETE",
				headers: {
					...config?.headers,
				},
			});
		};

		const doRequest = async ({
			url,
			method,
			query,
			config,
		}: {
			url: string;
			method: HttpMethod;
			query?: { [key: string]: string };
			config?: RequestInit;
		}) => {
			const queuedRequestFunction = () => {
				if (method === "GET") {
					return doGet(url, query, config);
				}

				if (method === "DELETE") {
					return doDelete(url, query, config);
				}

				/**
				 * If the user's backend has a validation for the request body being missing, it is
				 * possible that it will fail for some of the dashboard requests (for example api
				 * key validation).
				 *
				 * This ensures that a body is always sent to the server even if the API itself does
				 * not consume it
				 */
				let bodyToUse: BodyInit = JSON.stringify({});

				if (config !== undefined && config.body !== null && config.body !== undefined) {
					bodyToUse = config.body;
				}

				return fetch(new URL(url), {
					...config,
					body: bodyToUse,
					method,
					headers: {
						...config?.headers,
						"Content-Type": "application/json",
					},
				});
			};

			let requestCompleted = false;
			let response: Response;

			requestQueueManager.addRequestToQueue(queuedRequestFunction, (_response) => {
				requestCompleted = true;
				response = _response;
			});

			const waitForResponse = async () => {
				while (!requestCompleted) {
					await new Promise((resolve) => {
						setTimeout(resolve, 10);
					});
				}
			};

			await waitForResponse();

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			return response;
		};

		Implementation.networkManager = { doRequest };

		return Implementation.networkManager;
	};

	setSelectedTenantIdToLocalStorage = function (this: Implementation, tenantId: string) {
		this.getLocalStorageHandler().setItem(StorageKeys.TENANT_ID, tenantId);
	};

	getSelectedTenantIdFromLocalStorage = function (this: Implementation) {
		return this.getLocalStorageHandler().getItem(StorageKeys.TENANT_ID);
	};

	fetchData = async function (
		this: Implementation,
		{
			url,
			method,
			query,
			config,
			shouldRedirectOnUnauthorised = true,
			ignoreErrors = false,
		}: {
			url: string;
			method: HttpMethod;
			query?: { [key: string]: string };
			config?: RequestInit;
			shouldRedirectOnUnauthorised?: boolean;
			ignoreErrors?: boolean;
		}
	) {
		const apiKeyInStorage = this.getLocalStorageHandler().getItem(StorageKeys.AUTH_KEY);
		const networkManager = this.getNetworkManager();

		let additionalHeaders: { [key: string]: string } = {};

		if (apiKeyInStorage !== undefined) {
			additionalHeaders = {
				...additionalHeaders,
				authorization: `Bearer ${apiKeyInStorage}`,
			};
		}

		const response: Response = await networkManager.doRequest({
			url,
			method,
			query,
			config: {
				...config,
				headers: {
					...config?.headers,
					...additionalHeaders,
				},
			},
		});

		if (ignoreErrors) {
			return { response };
		}

		if (response.status === HTTPStatusCodes.FORBIDDEN) {
			let message = (await response.clone().json())?.message;
			if (message === undefined) {
				message = "You do not have access to this page";
			}
			window.dispatchEvent(getAccessDeniedEvent(message));

			/*	throwing this error just to make sure that this case is handled in some places in the application.
					global search for ForbiddenError.isThisError to see those places
				*/

			throw new ForbiddenError(message);
		}

		const logoutAndRedirect = shouldRedirectOnUnauthorised && HTTPStatusCodes.UNAUTHORIZED === response.status;
		let statusCode;
		if (logoutAndRedirect) {
			window.localStorage.removeItem(StorageKeys.AUTH_KEY);
			window.location.reload();
		} else {
			statusCode = ignoreErrors ? 200 : response.status;
		}

		return { response, statusCode };
	};

	getNavigation = function (this: Implementation) {
		const ROUTES = {
			USERS: "/",
			ROLES: "/roles",
			TENANTS: "/tenants",
		} as const;

		const QUERY_PARAMS = {
			USER_ID: "userid",
			TENANT_ID: "tenantid",
			ROLE_ID: "roleid",
		} as const;

		const ITEMS: { id: string; label: string; href: string; icon?: JSX.Element }[] = [
			{
				id: "user-management",
				label: "User Management",
				href: ROUTES.USERS,
				icon: <UserManagementIcon />,
			},
			{
				id: "roles-and-permissions",
				label: "Roles and Permissions",
				href: ROUTES.ROLES,
				icon: <PermissionsIcon />,
			},
			{
				id: "tenant-management",
				label: "Tenant Management",
				href: ROUTES.TENANTS,
				icon: <TenantManagementIcon />,
			},
		];

		const helpers = (navigate: NavigateFunction) => ({
			goToUserDetail: (userId: string) => {
				navigate(`${ROUTES.USERS}?${QUERY_PARAMS.USER_ID}=${userId}`, { replace: true });
			},

			goToTenantDetail: (tenantId: string) => {
				navigate(`${ROUTES.TENANTS}?${QUERY_PARAMS.TENANT_ID}=${tenantId}`);
			},

			goToUsersList: () => {
				navigate(ROUTES.USERS);
			},

			goToTenantsList: () => {
				navigate(ROUTES.TENANTS);
			},

			goToRoles: () => {
				navigate(ROUTES.ROLES);
			},

			goToRoleDetails: (roleId: string) => {
				navigate(`${ROUTES.ROLES}?${QUERY_PARAMS.ROLE_ID}=${roleId}`);
			},
		});

		return {
			ITEMS,
			ROUTES,
			QUERY_PARAMS,
			helpers,
		};
	};

	// Auth methods
	validateSignInCredentials = async function (
		this: Implementation,
		input: {
			email: string;
			password: string;
			signIn: (params: { email: string; password: string }) => Promise<Response>;
			onSuccess: () => void;
			setServerValidationError: (error: string) => void;
		}
	): Promise<void> {
		const { email, password, signIn, onSuccess, setServerValidationError } = input;
		const response = await signIn({ email, password });
		const body = await response.json();
		if (response.status === 200) {
			switch (body.status) {
				case "OK":
					const { localStorageHandler } = await import("@shared/services/storage");
					const { StorageKeys } = await import("@shared/constants");
					localStorageHandler.setItem(StorageKeys.AUTH_KEY, body.sessionId);
					localStorageHandler.setItem(StorageKeys.EMAIL, email);
					onSuccess();
					break;
				case "USER_LIMIT_REACHED_ERROR":
					setServerValidationError(body.message);
					break;
				case "USER_SUSPENDED_ERROR":
					setServerValidationError(
						"User is currently suspended. Please sign in with another account, or reactivate the SuperTokens core license key."
					);
					break;
				default:
					setServerValidationError("Incorrect email and password combination");
					break;
			}
		} else {
			setServerValidationError("Something went wrong");
		}
	};

	checkSignInValuesForErrors = async function (
		this: Implementation,
		input: {
			email: string;
			password: string;
		}
	): Promise<{ email: string; password: string }> {
		const { email, password } = input;
		const { validateEmail } = await import("@shared/utils/form");
		const errors: { email: string; password: string } = {
			email: "",
			password: "",
		};
		if (!email) errors.email = "Email cannot be empty";
		if (!password) errors.password = "Password cannot be empty";
		if (!validateEmail(email)) errors.email = "Email is invalid";
		return errors;
	};

	validateApiKey = async function (
		this: Implementation,
		input: {
			apiKey: string;
			fetchData: (params: any) => Promise<Response>;
			onSuccess: () => void;
			setApiKeyFieldError: (error: string) => void;
		}
	): Promise<void> {
		const { apiKey, fetchData, onSuccess, setApiKeyFieldError } = input;
		const { getApiUrl } = await import("@shared/utils");
		const { HTTPStatusCodes, StorageKeys } = await import("@shared/constants");
		const { localStorageHandler } = await import("@shared/services/storage");

		const response = await fetchData({
			url: getApiUrl("/api/key/validate"),
			method: "POST",
			config: {
				headers: {
					authorization: `Bearer ${apiKey}`,
				},
			},
			shouldRedirectOnUnauthorised: false,
		});

		const body = await response.json();

		if (response.status === 200 && body.status === "OK") {
			localStorageHandler.setItem(StorageKeys.AUTH_KEY, apiKey);
			onSuccess();
		} else if (response.status === HTTPStatusCodes.UNAUTHORIZED) {
			setApiKeyFieldError("Invalid API Key");
		} else {
			setApiKeyFieldError("Something went wrong");
		}
	};

	// User management methods
	createEmailPasswordUser = async function (
		this: Implementation,
		input: {
			tenantId: string;
			email: string;
			password: string;
			createEmailPasswordUserService: (
				tenantId: string,
				email: string,
				password: string
			) => Promise<any>;
			showErrorToast: (message: string) => void;
			showSuccessToast: (message: string) => void;
			setEmailError: (error: string | undefined) => void;
			setPasswordError: (error: string | undefined) => void;
			invalidateQueries: () => Promise<void>;
			onSuccess?: (userId: string) => void;
		}
	): Promise<void> {
		const {
			tenantId,
			email,
			password,
			createEmailPasswordUserService,
			showErrorToast,
			showSuccessToast,
			setEmailError,
			setPasswordError,
			invalidateQueries,
			onSuccess,
		} = input;

		const { STATUS, MESSAGES } = await import("@features/users/constants/createUser");

		const response = await createEmailPasswordUserService(tenantId, email, password);

		if (response.status === STATUS.EMAIL_ALREADY_EXISTS_ERROR) {
			showErrorToast(MESSAGES.EMAIL_ALREADY_EXISTS);
			return;
		}

		if (response.status === STATUS.EMAIL_VALIDATION_ERROR) {
			setEmailError(response.message);
			return;
		}

		if (response.status === STATUS.PASSWORD_VALIDATION_ERROR) {
			setPasswordError(response.message);
			return;
		}

		if (response.status === STATUS.FEATURE_NOT_ENABLED_ERROR) {
			showErrorToast(MESSAGES.FEATURE_NOT_ENABLED);
			return;
		}

		if (response.status === STATUS.OK) {
			showSuccessToast(MESSAGES.SUCCESS);
			await invalidateQueries();
			onSuccess?.(response.user.id);
		}
	};

	createPasswordlessUser = async function (
		this: Implementation,
		input: {
			tenantId: string;
			payload: { email?: string; phoneNumber?: string };
			authMethod: "EMAIL" | "PHONE" | "EMAIL_OR_PHONE" | undefined;
			emailOrPhone?: string;
			createPasswordlessUserService: (
				tenantId: string,
				payload: { email?: string; phoneNumber?: string }
			) => Promise<any>;
			showErrorToast: (message: string) => void;
			showSuccessToast: (message: string) => void;
			setFormError: (error: string | undefined) => void;
			invalidateQueries: () => Promise<void>;
			onSuccess?: (userId: string) => void;
		}
	): Promise<void> {
		const {
			tenantId,
			payload,
			authMethod,
			emailOrPhone,
			createPasswordlessUserService,
			showErrorToast,
			showSuccessToast,
			setFormError,
			invalidateQueries,
			onSuccess,
		} = input;

		const { STATUS, MESSAGES } = await import("@features/users/constants/createUser");

		const response = await createPasswordlessUserService(tenantId, payload);

		// Handle validation errors
		if (response.status === STATUS.EMAIL_VALIDATION_ERROR || response.status === STATUS.PHONE_VALIDATION_ERROR) {
			if (
				authMethod === "EMAIL_OR_PHONE" &&
				response.status === STATUS.EMAIL_VALIDATION_ERROR &&
				emailOrPhone &&
				!this.isPhoneNumber(emailOrPhone)
			) {
				setFormError(MESSAGES.INVALID_EMAIL_OR_PHONE);
			} else {
				setFormError(response.message);
			}
			return;
		}

		// Handle feature not enabled error
		if (response.status === STATUS.FEATURE_NOT_ENABLED_ERROR) {
			showErrorToast(MESSAGES.FEATURE_NOT_ENABLED);
			return;
		}

		// Handle successful response
		if (response.status === STATUS.OK) {
			if (response.createdNewRecipeUser === false) {
				const errorMessage = this.getPasswordlessExistingUserErrorMessage(authMethod, emailOrPhone);
				showErrorToast(errorMessage);
			} else {
				showSuccessToast(MESSAGES.SUCCESS);
				await invalidateQueries();
				onSuccess?.(response.user.id);
			}
		}
	};

	buildPasswordlessPayload = function (
		this: Implementation,
		input: {
			authMethod: "EMAIL" | "PHONE" | "EMAIL_OR_PHONE" | undefined;
			email: string;
			phoneNumber: string;
			emailOrPhone: string;
			setShowPhoneInput: (show: boolean) => void;
		}
	): { email?: string; phoneNumber?: string } | null {
		const { authMethod, email, phoneNumber, emailOrPhone, setShowPhoneInput } = input;

		const payload: { email?: string; phoneNumber?: string } = {};

		if (authMethod === "EMAIL") {
			payload.email = email;
		} else if (authMethod === "PHONE") {
			payload.phoneNumber = phoneNumber;
		} else if (authMethod === "EMAIL_OR_PHONE") {
			if (this.isPhoneNumber(emailOrPhone)) {
				const normalizedPhone = this.normalizePhoneNumber(emailOrPhone);
				payload.phoneNumber = normalizedPhone;
				setShowPhoneInput(true);
			} else {
				payload.email = emailOrPhone;
			}
		} else {
			return null;
		}

		return payload;
	};

	getPasswordlessExistingUserErrorMessage = function (
		this: Implementation,
		authMethod: "EMAIL" | "PHONE" | "EMAIL_OR_PHONE" | undefined,
		emailOrPhone?: string
	): string {
		const MESSAGES = {
			EMAIL_ALREADY_EXISTS: "User with this email already exists!",
			PHONE_ALREADY_EXISTS: "User with this phone number already exists!",
		};

		if (authMethod === "EMAIL") {
			return MESSAGES.EMAIL_ALREADY_EXISTS;
		} else if (authMethod === "PHONE") {
			return MESSAGES.PHONE_ALREADY_EXISTS;
		} else {
			return emailOrPhone && this.isPhoneNumber(emailOrPhone)
				? MESSAGES.PHONE_ALREADY_EXISTS
				: MESSAGES.EMAIL_ALREADY_EXISTS;
		}
	};

	isPhoneNumber = function (this: Implementation, value: string): boolean {
		const trimmedString = value.replaceAll(/\s/g, "").trim();

		// added this check since parsing a empty string to a number returns 0.
		if (trimmedString.length < 1) {
			return false;
		}

		return !isNaN(Number(trimmedString));
	};

	normalizePhoneNumber = function (this: Implementation, phoneNumber: string): string {
		return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
	};

	// Metadata processing
	processUserMetadata = async function (
		this: Implementation,
		input: {
			data: any;
		}
	): Promise<string | undefined> {
		const { data } = input;

		if (data === "FEATURE_NOT_ENABLED_ERROR") {
			return "Feature Not Enabled";
		}

		if (data === undefined) {
			return undefined;
		}

		if (typeof data === "string") {
			return data;
		}

		return JSON.stringify(data);
	};

	// User update logic
	buildUserUpdateParameters = async function (
		this: Implementation,
		input: {
			userId: string;
			user: any;
			tenants: any[];
		}
	): Promise<{
		userId: string;
		recipeId: string;
		recipeUserId: string;
		email?: string;
		phone?: string;
		firstName?: string;
		lastName?: string;
		tenantId: string;
	}> {
		const { userId, user, tenants } = input;

		return {
			userId,
			recipeId: user.loginMethods[0]?.recipeId || "emailpassword",
			recipeUserId: user.loginMethods[0]?.recipeUserId || userId,
			email: user.loginMethods[0]?.email,
			phone: user.loginMethods[0]?.phoneNumber,
			firstName: user.firstName,
			lastName: user.lastName,
			tenantId: tenants[0]?.tenantId || "public",
		};
	};

	// Tenant management methods
	processFetchTenantsResponse = async function (
		this: Implementation,
		input: {
			response: any;
		}
	): Promise<any[]> {
		const { response } = input;

		if (!response) {
			throw new Error("Failed to fetch tenants");
		}

		if (response.status === "OK") {
			return response.tenants;
		}

		throw new Error("Failed to fetch tenants");
	};

	filterTenantsBySearchQuery = function (
		this: Implementation,
		input: {
			tenants: any[];
			searchQuery: string;
		}
	): any[] {
		const { tenants, searchQuery } = input;

		if (!searchQuery.trim()) {
			return tenants;
		}

		const query = searchQuery.toLowerCase().trim();
		return tenants.filter((tenant: any) => tenant.tenantId.toLowerCase().includes(query));
	};

	processFetchTenantDetailsResponse = async function (
		this: Implementation,
		input: {
			response: any;
		}
	): Promise<any> {
		const { response } = input;

		if (!response) {
			throw new Error("Failed to fetch tenant details");
		}

		if (response.status === "OK") {
			return response.tenant;
		}

		if (response.status === "UNKNOWN_TENANT_ERROR") {
			throw new Error("Tenant not found");
		}

		throw new Error("Failed to fetch tenant details");
	};

	// Roles and Permissions methods
	processFetchRolesResponse = async function (
		this: Implementation,
		input: {
			response: any;
		}
	): Promise<{ roles: any[]; isFeatureEnabled: boolean }> {
		const { response } = input;

		if (!response) {
			throw new Error("Failed to fetch roles");
		}

		if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
			return {
				roles: [],
				isFeatureEnabled: false,
			};
		}

		const rolesWithUndefinedPermissions = response.roles.reverse().map((role: string) => ({
			role,
			permissions: undefined,
		}));

		return {
			roles: rolesWithUndefinedPermissions,
			isFeatureEnabled: true,
		};
	};

	filterRolesBySearchQuery = function (
		this: Implementation,
		input: {
			roles: any[];
			searchQuery: string;
		}
	): any[] {
		const { roles, searchQuery } = input;

		if (!searchQuery.trim()) {
			return roles;
		}

		const query = searchQuery.toLowerCase().trim();
		return roles.filter((role: any) => role.role.toLowerCase().includes(query));
	};

	processPermissionsResponse = async function (
		this: Implementation,
		input: {
			response: any;
		}
	): Promise<string[]> {
		const { response } = input;

		if (!response) {
			throw new Error("Failed to fetch permissions");
		}

		if (response.status === "OK") {
			return response.permissions;
		}

		if (response.status === "UNKNOWN_ROLE_ERROR") {
			throw new Error("Role not found");
		}

		if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
			throw new Error("Feature not enabled");
		}

		throw new Error("Failed to fetch permissions");
	};

	mergePermissionsWithDeduplication = function (
		this: Implementation,
		input: {
			currentPermissions: string[];
			newPermissions: string[];
		}
	): string[] {
		const { currentPermissions, newPermissions } = input;
		return Array.from(new Set([...currentPermissions, ...newPermissions]));
	};

	// Analytics methods
	fireAnalyticsEvent = async function (
		this: Implementation,
		input: {
			data: Record<string, unknown>;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string) => string;
			dashboardVersion: string;
		}
	): Promise<void> {
		const { data, fetchData, getApiUrl, dashboardVersion } = input;

		await fetchData({
			url: getApiUrl("/api/analytics"),
			method: "POST",
			config: {
				body: JSON.stringify({
					...data,
					dashboardVersion,
				}),
			},
			// We dont want to trigger the error boundary if this API fails
			ignoreErrors: true,
		});
	};

	// Search methods
	processSearchTagsResponse = async function (
		this: Implementation,
		input: {
			response: Response;
		}
	): Promise<{ status: string; tags: string[] } | undefined> {
		const { response } = input;
		return response.ok ? await response.json() : undefined;
	};

	// Tenant sorting
	sortTenants = function (
		this: Implementation,
		input: {
			tenants: any[];
		}
	): any[] {
		const { tenants } = input;
		// Ensure the public tenant is the first result, followed by all other tenants in alphabetical order
		return tenants.sort((a: any, b: any) =>
			(a.tenantId === "public" ? "" : a.tenantId).localeCompare(b.tenantId === "public" ? "" : b.tenantId)
		);
	};

	// Third Party Provider URL building
	buildThirdPartyProviderUrl = function (
		this: Implementation,
		input: {
			providerId: string;
			additionalConfig?: Record<string, string>;
		}
	): string {
		const { providerId, additionalConfig } = input;
		const additionalConfigQueryParams = new URLSearchParams(additionalConfig).toString();

		return `/api/thirdparty/config?thirdPartyId=${providerId}${
			additionalConfigQueryParams ? `&${additionalConfigQueryParams}` : ""
		}`;
	};

	buildDeleteThirdPartyProviderUrl = function (
		this: Implementation,
		input: {
			providerId: string;
		}
	): string {
		const { providerId } = input;
		return `/api/thirdparty/config?thirdPartyId=${providerId}`;
	};

	// Users query building
	buildUsersQueryParams = function (
		this: Implementation,
		input: {
			param?: { paginationToken?: string; limit?: number };
			search?: object;
			defaultLimit: number;
		}
	): Record<string, any> {
		const { param, search, defaultLimit } = input;
		let query: Record<string, any> = {};

		if (search) {
			query = { ...search };
		}

		if (param && Object.keys(param).includes("paginationToken")) {
			query = { ...query, paginationToken: param?.paginationToken };
		}

		if (param && Object.keys(param).includes("limit")) {
			query = { ...query, limit: param?.limit };
		} else {
			query = { ...query, limit: defaultLimit };
		}

		return query;
	};

	// User response processing
	processGetUserResponse = async function (
		this: Implementation,
		input: {
			response: Response;
		}
	): Promise<any> {
		const { response } = input;

		if (response.ok) {
			const body = await response.json();

			if (body.status === "NO_USER_FOUND_ERROR") {
				return {
					status: "NO_USER_FOUND_ERROR",
				};
			}

			if (body.status === "RECIPE_NOT_INITIALISED") {
				return {
					status: "RECIPE_NOT_INITIALISED",
				};
			}

			return body;
		}

		return {
			status: "NO_USER_FOUND_ERROR",
		};
	};

	// User update logic
	prepareUserUpdatePayload = function (
		this: Implementation,
		input: {
			userId: string;
			recipeId: string;
			recipeUserId: string;
			email?: string;
			phone?: string;
			firstName?: string;
			lastName?: string;
		}
	): any {
		const { userId, recipeId, recipeUserId, email, phone, firstName, lastName } = input;

		let emailToSend = email === undefined ? "" : email;
		const phoneToSend = phone === undefined ? "" : phone;
		const firstNameToSend = firstName === undefined ? "" : firstName;
		const lastNameToSend = lastName === undefined ? "" : lastName;

		// Special handling for thirdparty: don't update email
		if (recipeId === "thirdparty") {
			emailToSend = "";
		}

		return {
			recipeId,
			userId,
			recipeUserId,
			phone: phoneToSend,
			email: emailToSend,
			firstName: firstNameToSend,
			lastName: lastNameToSend,
		};
	};
}
