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
import { ProviderConfig, ProviderConfigResponse, Tenant, TenantInfo } from "./types";

export const useListTenantsService = () => {
	const fetchData = useFetchData();

	const fetchTenants = async (): Promise<{
		status: "OK";
		tenants: Tenant[];
	}> => {
		const response = await fetchData({
			method: "GET",
			url: getApiUrl("/api/tenants"),
		});

		const result = response.ok ? await response.json() : undefined;

		// Ensure the public tenant is the first result, followed by all other tenants in alphabetical order
		result.tenants.sort((a: Tenant, b: Tenant) =>
			(a.tenantId === "public" ? "" : a.tenantId).localeCompare(b.tenantId === "public" ? "" : b.tenantId)
		);

		return result;
	};

	return {
		fetchTenants,
	};
};

export const useCreateTenantService = () => {
	const fetchData = useFetchData();

	const createTenant = async (
		tenantId: string
	): Promise<
		| {
				status: "OK";
				createdNew: boolean;
		  }
		| {
				status: "MULTITENANCY_NOT_ENABLED_IN_CORE_ERROR" | "TENANT_ID_ALREADY_EXISTS_ERROR";
		  }
		| {
				status: "INVALID_TENANT_ID_ERROR";
				message: string;
		  }
	> => {
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

	return createTenant;
};

export const useGetTenantInfoService = () => {
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
	> => {
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

export const useDeleteTenantService = () => {
	const fetchData = useFetchData();

	const deleteTenant = async (tenantId: string): Promise<{ status: "OK" }> => {
		const response = await fetchData({
			url: getApiUrl("/api/tenant", tenantId),
			method: "DELETE",
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Unknown error");
	};

	return deleteTenant;
};

export const useUpdateFirstFactorService = () => {
	const fetchData = useFetchData();

	const updateFirstFactor = async (
		tenantId: string,
		factorId: string,
		enable: boolean
	): Promise<
		| { status: "OK" }
		| { status: "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR"; message: string }
		| { status: "UNKNOWN_TENANT_ERROR" }
	> => {
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

	return updateFirstFactor;
};

export const useUpdateRequiredSecondaryFactorService = () => {
	const fetchData = useFetchData();

	const updateRequiredSecondaryFactor = async (
		tenantId: string,
		factorId: string,
		enable: boolean
	): Promise<
		| { status: "OK"; isMFARequirementsForAuthOverridden: boolean }
		| { status: "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR"; message: string }
		| { status: "MFA_NOT_INITIALIZED_ERROR" }
		| { status: "UNKNOWN_TENANT_ERROR" }
	> => {
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

	return updateRequiredSecondaryFactor;
};

export const useUpdateCoreConfigService = () => {
	const fetchData = useFetchData();

	const updateCoreConfig = async (
		tenantId: string,
		name: string,
		value: string | number | boolean | null
	): Promise<
		{ status: "OK" } | { status: "UNKNOWN_TENANT_ERROR" } | { status: "INVALID_CONFIG_ERROR"; message: string }
	> => {
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

export const useGetThirdPartyProviderInfoService = () => {
	const fetchData = useFetchData();

	const getThirdPartyProviderInfo = async (
		tenantId: string,
		providerId: string,
		additionalConfig?: Record<string, string>
	): Promise<
		| {
				status: "OK";
				providerConfig: ProviderConfigResponse;
		  }
		| {
				status: "UNKNOWN_TENANT_ERROR";
		  }
	> => {
		const additionalConfigQueryParams = new URLSearchParams(additionalConfig).toString();

		const response = await fetchData({
			url: getApiUrl(
				`/api/thirdparty/config?thirdPartyId=${providerId}${
					additionalConfigQueryParams ? `&${additionalConfigQueryParams}` : ""
				}`,
				tenantId
			),
			method: "GET",
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Unknown error");
	};

	return getThirdPartyProviderInfo;
};

export const useCreateOrUpdateThirdPartyProviderService = () => {
	const fetchData = useFetchData();

	const createOrUpdateThirdPartyProvider = async (
		tenantId: string,
		providerConfig: ProviderConfig
	): Promise<{ status: "OK" } | { status: "UNKNOWN_TENANT_ERROR" } | { status: "BOXY_ERROR"; message: string }> => {
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

	return createOrUpdateThirdPartyProvider;
};

export const useDeleteThirdPartyProviderService = () => {
	const fetchData = useFetchData();

	const deleteThirdPartyProvider = async (
		tenantId: string,
		providerId: string
	): Promise<{ status: "OK" } | { status: "UNKNOWN_TENANT_ERROR" }> => {
		const response = await fetchData({
			url: getApiUrl(`/api/thirdparty/config?thirdPartyId=${providerId}`, tenantId),
			method: "DELETE",
		});

		if (response.ok) {
			return {
				status: "OK",
			};
		}

		throw new Error("Unknown error");
	};

	return deleteThirdPartyProvider;
};
