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
}
