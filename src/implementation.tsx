import { NavigateFunction } from "react-router-dom";
import { OverrideableBuilder } from "supertokens-js-override";

import { ImplType } from "./types";

import { getAccessDeniedEvent } from "@shared/events/accessDenied";
import { HTTPStatusCodes, StorageKeys } from "@shared/constants";
import { HttpMethod } from "@features/auth/types";
import { ForbiddenError } from "@shared/utils/customErrors";
import { validateEmail } from "@shared/utils/form";
import { getApiUrl } from "@shared/utils";
import { STATUS as USER_CREATE_STATUS, MESSAGES as USER_CREATE_MESSAGES } from "@features/users/constants/createUser";

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
				case "OK": {
					const localStorageHandler = this.getLocalStorageHandler();
					localStorageHandler.setItem(StorageKeys.AUTH_KEY, body.sessionId);
					localStorageHandler.setItem(StorageKeys.EMAIL, email);
					onSuccess();
					break;
				}
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
		const localStorageHandler = this.getLocalStorageHandler();

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

		const response = await createEmailPasswordUserService(tenantId, email, password);

		if (response.status === USER_CREATE_STATUS.EMAIL_ALREADY_EXISTS_ERROR) {
			showErrorToast(USER_CREATE_MESSAGES.EMAIL_ALREADY_EXISTS);
			return;
		}

		if (response.status === USER_CREATE_STATUS.EMAIL_VALIDATION_ERROR) {
			setEmailError(response.message);
			return;
		}

		if (response.status === USER_CREATE_STATUS.PASSWORD_VALIDATION_ERROR) {
			setPasswordError(response.message);
			return;
		}

		if (response.status === USER_CREATE_STATUS.FEATURE_NOT_ENABLED_ERROR) {
			showErrorToast(USER_CREATE_MESSAGES.FEATURE_NOT_ENABLED);
			return;
		}

		if (response.status === USER_CREATE_STATUS.OK) {
			showSuccessToast(USER_CREATE_MESSAGES.SUCCESS);
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

		const response = await createPasswordlessUserService(tenantId, payload);

		// Handle validation errors
		if (
			response.status === USER_CREATE_STATUS.EMAIL_VALIDATION_ERROR ||
			response.status === USER_CREATE_STATUS.PHONE_VALIDATION_ERROR
		) {
			if (
				authMethod === "EMAIL_OR_PHONE" &&
				response.status === USER_CREATE_STATUS.EMAIL_VALIDATION_ERROR &&
				emailOrPhone &&
				!this.isPhoneNumber(emailOrPhone)
			) {
				setFormError(USER_CREATE_MESSAGES.INVALID_EMAIL_OR_PHONE);
			} else {
				setFormError(response.message);
			}
			return;
		}

		// Handle feature not enabled error
		if (response.status === USER_CREATE_STATUS.FEATURE_NOT_ENABLED_ERROR) {
			showErrorToast(USER_CREATE_MESSAGES.FEATURE_NOT_ENABLED);
			return;
		}

		// Handle successful response
		if (response.status === USER_CREATE_STATUS.OK) {
			if (response.createdNewRecipeUser === false) {
				const errorMessage = this.getPasswordlessExistingUserErrorMessage(authMethod, emailOrPhone);
				showErrorToast(errorMessage);
			} else {
				showSuccessToast(USER_CREATE_MESSAGES.SUCCESS);
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

	// Search API methods
	fetchSearchTags = async function (
		this: Implementation,
		input: {
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<{ status: string; tags: string[] } | undefined> {
		const { fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/search/tags"),
			method: "GET",
		});
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

	// Tenant API methods
	fetchTenants = async function (
		this: Implementation,
		input: {
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<{ status: "OK"; tenants: any[] }> {
		const { fetchData, getApiUrl } = input;
		const response = await fetchData({
			method: "GET",
			url: getApiUrl("/api/tenants"),
		});

		const result = response.ok ? await response.json() : undefined;

		// Sort tenants using existing helper method
		result.tenants = this.sortTenants({ tenants: result.tenants });

		return result;
	};

	createTenant = async function (
		this: Implementation,
		input: {
			tenantId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<
		| { status: "OK"; createdNew: boolean }
		| { status: "MULTITENANCY_NOT_ENABLED_IN_CORE_ERROR" | "TENANT_ID_ALREADY_EXISTS_ERROR" }
		| { status: "INVALID_TENANT_ID_ERROR"; message: string }
	> {
		const { tenantId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/tenant"),
			method: "POST",
			config: {
				body: JSON.stringify({
					tenantId,
				}),
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		throw new Error("Unknown error");
	};

	getTenantInfo = async function (
		this: Implementation,
		input: {
			tenantId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<{ status: "OK"; tenant: any } | { status: "UNKNOWN_TENANT_ERROR" }> {
		const { tenantId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/tenant", tenantId),
			method: "GET",
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		throw new Error("Unknown error");
	};

	deleteTenant = async function (
		this: Implementation,
		input: {
			tenantId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<{ status: "OK" }> {
		const { tenantId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/tenant", tenantId),
			method: "DELETE",
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Unknown error");
	};

	updateFirstFactor = async function (
		this: Implementation,
		input: {
			tenantId: string;
			factorId: string;
			enable: boolean;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<
		| { status: "OK" }
		| { status: "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR"; message: string }
		| { status: "UNKNOWN_TENANT_ERROR" }
	> {
		const { tenantId, factorId, enable, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/tenant/first-factor", tenantId),
			method: "PUT",
			config: {
				body: JSON.stringify({
					factorId,
					enable,
				}),
			},
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Unknown error");
	};

	updateRequiredSecondaryFactor = async function (
		this: Implementation,
		input: {
			tenantId: string;
			factorId: string;
			enable: boolean;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<
		| { status: "OK"; isMFARequirementsForAuthOverridden: boolean }
		| { status: "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR"; message: string }
		| { status: "MFA_NOT_INITIALIZED_ERROR" }
		| { status: "UNKNOWN_TENANT_ERROR" }
	> {
		const { tenantId, factorId, enable, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/tenant/required-secondary-factor", tenantId),
			method: "PUT",
			config: {
				body: JSON.stringify({
					factorId,
					enable,
				}),
			},
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Unknown error");
	};

	updateCoreConfig = async function (
		this: Implementation,
		input: {
			tenantId: string;
			name: string;
			value: string | number | boolean | null;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<
		{ status: "OK" } | { status: "UNKNOWN_TENANT_ERROR" } | { status: "INVALID_CONFIG_ERROR"; message: string }
	> {
		const { tenantId, name, value, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/tenant/core-config", tenantId),
			method: "PUT",
			config: {
				body: JSON.stringify({
					name,
					value,
				}),
			},
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Unknown error");
	};

	getThirdPartyProviderInfo = async function (
		this: Implementation,
		input: {
			tenantId: string;
			providerId: string;
			additionalConfig?: Record<string, string>;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<{ status: "OK"; providerConfig: any } | { status: "UNKNOWN_TENANT_ERROR" }> {
		const { tenantId, providerId, additionalConfig, fetchData, getApiUrl } = input;
		const url = this.buildThirdPartyProviderUrl({
			providerId,
			additionalConfig,
		});

		const response = await fetchData({
			url: getApiUrl(url, tenantId),
			method: "GET",
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Unknown error");
	};

	createOrUpdateThirdPartyProvider = async function (
		this: Implementation,
		input: {
			tenantId: string;
			providerConfig: any;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<{ status: "OK" } | { status: "UNKNOWN_TENANT_ERROR" } | { status: "BOXY_ERROR"; message: string }> {
		const { tenantId, providerConfig, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/thirdparty/config", tenantId),
			method: "PUT",
			config: {
				body: JSON.stringify({
					providerConfig,
				}),
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		throw new Error("Unknown error");
	};

	deleteThirdPartyProvider = async function (
		this: Implementation,
		input: {
			tenantId: string;
			providerId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<{ status: "OK" } | { status: "UNKNOWN_TENANT_ERROR" }> {
		const { tenantId, providerId, fetchData, getApiUrl } = input;
		const url = this.buildDeleteThirdPartyProviderUrl({
			providerId,
		});

		const response = await fetchData({
			url: getApiUrl(url, tenantId),
			method: "DELETE",
		});

		if (response.ok) {
			return {
				status: "OK",
			};
		}

		throw new Error("Unknown error");
	};

	// Users API methods
	fetchUsers = async function (
		this: Implementation,
		input: {
			param?: { paginationToken?: string; limit?: number };
			search?: object;
			tenantId?: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
			defaultLimit: number;
		}
	): Promise<any | undefined> {
		const { param, search, tenantId, fetchData, getApiUrl, defaultLimit } = input;
		const query = this.buildUsersQueryParams({
			param,
			search,
			defaultLimit,
		});

		const response = await fetchData({
			url: getApiUrl("/api/users", tenantId),
			method: "GET",
			query: query,
		});
		return response.ok ? await response.json() : undefined;
	};

	fetchUsersCount = async function (
		this: Implementation,
		input: {
			tenantId?: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any | undefined> {
		const { tenantId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/users/count", tenantId),
			method: "GET",
		});

		return response.ok ? await response.json() : undefined;
	};

	// Users query building (helper method)
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

	// User API methods
	getUser = async function (
		this: Implementation,
		input: {
			userId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any> {
		const { userId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user"),
			method: "GET",
			query: {
				userId,
			},
		});

		return await this.processGetUserResponse({ response });
	};

	updateUserInformation = async function (
		this: Implementation,
		input: {
			userId: string;
			recipeId: string;
			recipeUserId: string;
			email?: string;
			phone?: string;
			firstName?: string;
			lastName?: string;
			tenantId?: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any> {
		const { userId, recipeId, recipeUserId, email, phone, firstName, lastName, tenantId, fetchData, getApiUrl } =
			input;

		const payload = this.prepareUserUpdatePayload({
			userId,
			recipeId,
			recipeUserId,
			email,
			phone,
			firstName,
			lastName,
		});

		const response = await fetchData({
			url: getApiUrl("/api/user", tenantId),
			method: "PUT",
			config: {
				body: JSON.stringify(payload),
			},
		});

		return await response.json();
	};

	// User response processing (helper method)
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

	// User update logic (helper method)
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

	// User Create API methods (low-level API wrappers)
	createEmailPasswordUserViaApi = async function (
		this: Implementation,
		input: {
			tenantId: string | undefined;
			email: string;
			password: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any> {
		const { tenantId, email, password, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user/emailpassword", tenantId),
			method: "POST",
			config: {
				body: JSON.stringify({
					email,
					password,
				}),
			},
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Something went wrong!");
	};

	createPasswordlessUserViaApi = async function (
		this: Implementation,
		input: {
			tenantId: string;
			data: { email?: string; phoneNumber?: string };
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any> {
		const { tenantId, data, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user/passwordless", tenantId),
			method: "POST",
			config: {
				body: JSON.stringify({
					...data,
				}),
			},
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Something went wrong!");
	};

	// User Delete API method
	deleteUser = async function (
		this: Implementation,
		input: {
			userId: string;
			removeAllLinkedAccounts: boolean;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<{ status: "OK" } | undefined> {
		const { userId, removeAllLinkedAccounts, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user"),
			method: "DELETE",
			query: {
				userId,
				removeAllLinkedAccounts: String(removeAllLinkedAccounts),
			},
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status !== "OK") {
				return undefined;
			}

			return body;
		}

		return undefined;
	};

	// User Metadata API methods
	getUserMetaData = async function (
		this: Implementation,
		input: {
			userId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<string | any> {
		const { userId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user/metadata"),
			method: "GET",
			query: {
				userId,
			},
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status === "FEATURE_NOT_ENABLED_ERROR") {
				return "FEATURE_NOT_ENABLED_ERROR";
			}

			if (body.status !== "OK") {
				return undefined;
			}

			return body.data;
		}

		return undefined;
	};

	updateUserMetaData = async function (
		this: Implementation,
		input: {
			userId: string;
			data: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any> {
		const { userId, fetchData, getApiUrl } = input;
		let { data } = input;
		data = data.replaceAll("\n", "");
		const response = await fetchData({
			url: getApiUrl("/api/user/metadata"),
			method: "PUT",
			config: {
				body: JSON.stringify({
					userId,
					data,
				}),
			},
		});

		if (response.status === 200) {
			return await response.json();
		}

		if (response.status === 400) {
			throw new Error("Invalid meta data");
		}

		throw new Error("Something went wrong");
	};

	// User Sessions API methods
	getSessionsForUser = async function (
		this: Implementation,
		input: {
			userId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any[] | undefined> {
		const { userId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user/sessions"),
			method: "GET",
			query: {
				userId,
			},
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status !== "OK") {
				return undefined;
			}

			return body.sessions;
		}

		return undefined;
	};

	deleteSessionsForUser = async function (
		this: Implementation,
		input: {
			sessionHandles: string[];
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<void> {
		const { sessionHandles, fetchData, getApiUrl } = input;
		await fetchData({
			url: getApiUrl("/api/user/sessions"),
			method: "POST",
			config: {
				body: JSON.stringify({
					sessionHandles,
				}),
			},
		});

		return;
	};

	// User Unlink API method
	unlinkUser = async function (
		this: Implementation,
		input: {
			recipeUserId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<{ status: "OK" } | undefined> {
		const { recipeUserId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user/unlink"),
			method: "GET",
			query: {
				recipeUserId: recipeUserId,
			},
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status !== "OK") {
				return undefined;
			}

			return body;
		}

		return undefined;
	};

	// User Email Verification API methods
	getUserEmailVerificationStatus = async function (
		this: Implementation,
		input: {
			userId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any> {
		const { userId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify"),
			method: "GET",
			query: { recipeUserId: userId },
		});

		const body = await response.json();
		return body;
	};

	updateUserEmailVerificationStatus = async function (
		this: Implementation,
		input: {
			userId: string;
			isEmailVerified: boolean;
			tenantId: string | undefined;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<boolean> {
		const { userId, isEmailVerified, tenantId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify", tenantId),
			method: "PUT",
			config: {
				body: JSON.stringify({ verified: isEmailVerified, recipeUserId: userId }),
			},
		});
		return response?.ok;
	};

	// User Email Verification Token API method
	sendUserEmailVerification = async function (
		this: Implementation,
		input: {
			userId: string;
			tenantId?: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<boolean> {
		const { userId, tenantId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify/token", tenantId),
			method: "POST",
			config: {
				body: JSON.stringify({
					recipeUserId: userId,
				}),
			},
		});
		return response?.ok;
	};

	// User Password Reset API method
	updatePassword = async function (
		this: Implementation,
		input: {
			userId: string;
			newPassword: string;
			tenantId: string | undefined;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any> {
		const { userId, newPassword, tenantId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/user/password", tenantId),
			method: "PUT",
			query: { userId },
			config: {
				body: JSON.stringify({
					recipeUserId: userId,
					newPassword,
				}),
			},
		});
		return await response.json();
	};

	// User Roles API methods
	getRoles = async function (
		this: Implementation,
		input: {
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any | undefined> {
		const { fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/userroles/roles"),
			method: "GET",
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};

	createRoleOrUpdateARole = async function (
		this: Implementation,
		input: {
			role: string;
			permissions: string[];
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any | undefined> {
		const { role, permissions, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/userroles/role"),
			method: "PUT",
			config: {
				body: JSON.stringify({
					role,
					permissions,
				}),
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};

	deleteRole = async function (
		this: Implementation,
		input: {
			role: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any | undefined> {
		const { role, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/userroles/role"),
			method: "DELETE",
			query: {
				role,
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};

	// User Roles Permissions API methods
	getPermissionsForRole = async function (
		this: Implementation,
		input: {
			role: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any | undefined> {
		const { role, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/userroles/role/permissions"),
			method: "GET",
			query: {
				role,
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};

	removePermissionsFromRole = async function (
		this: Implementation,
		input: {
			role: string;
			permissions: string[];
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any | undefined> {
		const { role, permissions, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/userroles/role/permissions/remove"),
			method: "PUT",
			config: {
				body: JSON.stringify({
					role,
					permissions,
				}),
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};

	// User Roles for User API methods
	addRoleToUser = async function (
		this: Implementation,
		input: {
			userId: string;
			role: string;
			tenantId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any | undefined> {
		const { userId, role, tenantId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/userroles/user/roles", tenantId),
			method: "PUT",
			config: {
				body: JSON.stringify({
					userId,
					role,
				}),
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};

	getRolesForUser = async function (
		this: Implementation,
		input: {
			userId: string;
			tenantId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any | undefined> {
		const { userId, tenantId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/userroles/user/roles", tenantId),
			method: "GET",
			query: {
				userId,
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};

	removeUserRole = async function (
		this: Implementation,
		input: {
			userId: string;
			role: string;
			tenantId: string;
			fetchData: (params: any) => Promise<any>;
			getApiUrl: (path: string, tenantId?: string) => string;
		}
	): Promise<any | undefined> {
		const { userId, role, tenantId, fetchData, getApiUrl } = input;
		const response = await fetchData({
			url: getApiUrl("/api/userroles/user/roles", tenantId),
			method: "DELETE",
			query: {
				userId,
				role,
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};
}
