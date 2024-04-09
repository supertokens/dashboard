/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
import { getApiUrl, useFetchData } from "../../utils";
import { ProviderConfig, ProviderConfigResponse, TenantInfo } from "./types";

export const useTenantCreateService = () => {
	const fetchData = useFetchData(true);

	const createOrUpdateTenant = async (
		tenantId: string
	): Promise<
		| {
				status: "OK";
				createdNew: boolean;
		  }
		| {
				status: "MULTITENANCY_NOT_ENABLED_IN_CORE";
		  }
		| {
				status: "INVALID_TENANT_ID";
				message: string;
		  }
		| undefined
	> => {
		// TODO: Temporary mock data
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			status: "OK",
			createdNew: true,
		};

		const response = await fetchData({
			url: getApiUrl("/api/tenant"),
			method: "PUT",
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

		return undefined;
	};

	return createOrUpdateTenant;
};

export const useTenantGetService = () => {
	const fetchData = useFetchData();

	const getTenantInfo = async (
		tenantId: string
	): Promise<
		| {
				status: "OK";
				tenant: TenantInfo;
		  }
		| {
				status: "UNKNOWN_TENANT_ERROR";
		  }
		| undefined
	> => {
		// TODO: Temporary mock data
		await new Promise((resolve) => setTimeout(resolve, 10));

		return {
			status: "OK",
			tenant: {
				tenantId,
				thirdParty: {
					providers: [],
				},
				firstFactors: ["thirdparty"],
				requiredSecondaryFactors: [],
				userCount: 12,
				coreConfig: [
					{
						key: "password_reset_token_lifetime",
						valueType: "number",
						value: 3600000,
						description: "The time in milliseconds for which the password reset token is valid.",
						isSaaSProtected: false,
						isDifferentAcrossTenants: true,
						isModifyableOnlyViaConfigYaml: false,
						defaultValue: 3600000,
						isNullable: false,
						isPluginProperty: false,
					},
					{
						key: "access_token_blacklisting",
						valueType: "boolean",
						value: false,
						description: "Whether to blacklist access tokens or not.",
						isSaaSProtected: false,
						isDifferentAcrossTenants: true,
						isModifyableOnlyViaConfigYaml: false,
						defaultValue: false,
						isNullable: false,
						isPluginProperty: false,
					},
					{
						key: "ip_allow_regex",
						valueType: "string",
						value: null,
						description: "The regex to match the IP address of the user.",
						isSaaSProtected: false,
						isDifferentAcrossTenants: true,
						isModifyableOnlyViaConfigYaml: false,
						defaultValue: null,
						isNullable: true,
						isPluginProperty: false,
					},
					{
						key: "postgresql_emailpassword_users_table_name",
						valueType: "string",
						value: null,
						description: "The name of the table where the emailpassword users are stored.",
						isSaaSProtected: false,
						isDifferentAcrossTenants: true,
						isModifyableOnlyViaConfigYaml: false,
						defaultValue: 3600000,
						isNullable: true,
						isPluginProperty: true,
					},
				],
			},
		};

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

	return getTenantInfo;
};

export const useTenantDeleteService = () => {
	const fetchData = useFetchData();

	const deleteTenant = async (tenantId: string): Promise<{ status: "OK" }> => {
		const response = await fetchData({
			url: getApiUrl("/api/tenant", tenantId),
			method: "DELETE",
		});

		// TODO: Temporary mock data
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			status: "OK",
		};

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Unknown error");
	};

	return deleteTenant;
};

export const useUpdateFirstFactorsService = () => {
	const fetchData = useFetchData();

	const updateFirstFactors = async (
		tenantId: string,
		factorId: string,
		enable: boolean
	): Promise<
		| { status: "OK" }
		| { status: "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK"; message: string }
		| { status: "UNKNOWN_TENANT_ERROR" }
	> => {
		// TODO: Temporary mock data
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			status: "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK",
			message: "Recipe not initialized",
		};

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

	return updateFirstFactors;
};

export const useUpdateSecondaryFactorsService = () => {
	const fetchData = useFetchData();

	const updateSecondaryFactors = async (
		tenantId: string,
		factorId: string,
		enable: boolean
	): Promise<
		| { status: "OK" }
		| { status: "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK"; message: string }
		| { status: "MFA_NOT_INITIALIZED" }
		| { status: "MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN" }
		| { status: "UNKNOWN_TENANT_ERROR" }
	> => {
		// TODO: Temporary mock data
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			status: "OK",
		};

		const response = await fetchData({
			url: getApiUrl("/api/tenant/secondary-factor", tenantId),
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

	return updateSecondaryFactors;
};

export const useUpdateCoreConfigService = () => {
	const fetchData = useFetchData();

	const updateCoreConfig = async (
		tenantId: string,
		name: string,
		value: string | number | boolean | null
	): Promise<
		{ status: "OK" } | { status: "UNKNOWN_TENANT_ERROR" } | { status: "INVALID_CONFIG"; message: string }
	> => {
		// TODO: Temporary mock data
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			status: "INVALID_CONFIG",
			message: "Invalid config",
		};

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

	return updateCoreConfig;
};

export const useGetThirdPartyProviderInfo = () => {
	const fetchData = useFetchData();

	const getThirdPartyProviderInfo = async (
		tenantId: string,
		providerId: string
	): Promise<
		| {
				status: "OK";
				providerConfig: ProviderConfigResponse;
		  }
		| {
				status: "UNKNOWN_TENANT_ERROR";
		  }
	> => {
		return {
			status: "OK",
			providerConfig: {
				oidcDiscoveryEndpoint: "https://oidc.discovery.endpoint",
				thirdPartyId: providerId,
				name: "Provider Name",
				clients: [
					{
						clientId: "client-id",
						clientSecret: "secret",
						scope: ["scope"],
						forcePKCE: false,
						additionalConfig: {},
					},
				],
				isGetAuthorisationRedirectUrlOverridden: false,
				isExchangeAuthCodeForOAuthTokensOverridden: false,
				isGetUserInfoOverridden: false,
			},
		};

		const response = await fetchData({
			url: getApiUrl(`/api/thirdparty/config?third-party-id=${providerId}`, tenantId),
			method: "GET",
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Unknown error");
	};

	return getThirdPartyProviderInfo;
};

export const useThirdPartyService = () => {
	const fetchData = useFetchData();

	const createOrUpdateThirdPartyProvider = async (tenantId: string, providerConfig: ProviderConfig) => {
		const response = await fetchData({
			url: getApiUrl("/api/tenants/third-party", tenantId),
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

	const deleteThirdPartyProvider = async (tenantId: string, providerId: string) => {
		const response = await fetchData({
			url: getApiUrl(`/api/tenants/third-party?thirdPartyId=${providerId}`, tenantId),
			method: "DELETE",
		});

		if (response.ok) {
			return {
				status: "OK",
			};
		}

		throw new Error("Unknown error");
	};

	return {
		createOrUpdateThirdPartyProvider,
		deleteThirdPartyProvider,
	};
};
