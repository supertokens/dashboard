/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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
import { getApiUrl, useFetchData } from "@shared/utils";
import { ProviderConfig, ProviderConfigResponse, Tenant, TenantInfo } from "./types";
import { Implementation } from "../../implementation";

export const useListTenantsService = () => {
	const fetchData = useFetchData();

	const fetchTenants = async (): Promise<{
		status: "OK";
		tenants: Tenant[];
	}> => {
		return await Implementation.getInstanceOrThrow().fetchTenants({ fetchData, getApiUrl });
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
		return await Implementation.getInstanceOrThrow().createTenant({ tenantId, fetchData, getApiUrl });
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
		return await Implementation.getInstanceOrThrow().getTenantInfo({ tenantId, fetchData, getApiUrl });
	};

	return getTenantInfo;
};

export const useDeleteTenantService = () => {
	const fetchData = useFetchData();

	const deleteTenant = async (tenantId: string): Promise<{ status: "OK" }> => {
		return await Implementation.getInstanceOrThrow().deleteTenant({ tenantId, fetchData, getApiUrl });
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
		return await Implementation.getInstanceOrThrow().updateFirstFactor({
			tenantId,
			factorId,
			enable,
			fetchData,
			getApiUrl,
		});
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
		return await Implementation.getInstanceOrThrow().updateRequiredSecondaryFactor({
			tenantId,
			factorId,
			enable,
			fetchData,
			getApiUrl,
		});
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
		return await Implementation.getInstanceOrThrow().updateCoreConfig({
			tenantId,
			name,
			value,
			fetchData,
			getApiUrl,
		});
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
		return await Implementation.getInstanceOrThrow().getThirdPartyProviderInfo({
			tenantId,
			providerId,
			additionalConfig,
			fetchData,
			getApiUrl,
		});
	};

	return getThirdPartyProviderInfo;
};

export const useCreateOrUpdateThirdPartyProviderService = () => {
	const fetchData = useFetchData();

	const createOrUpdateThirdPartyProvider = async (
		tenantId: string,
		providerConfig: ProviderConfig
	): Promise<{ status: "OK" } | { status: "UNKNOWN_TENANT_ERROR" } | { status: "BOXY_ERROR"; message: string }> => {
		return await Implementation.getInstanceOrThrow().createOrUpdateThirdPartyProvider({
			tenantId,
			providerConfig,
			fetchData,
			getApiUrl,
		});
	};

	return createOrUpdateThirdPartyProvider;
};

export const useDeleteThirdPartyProviderService = () => {
	const fetchData = useFetchData();

	const deleteThirdPartyProvider = async (
		tenantId: string,
		providerId: string
	): Promise<{ status: "OK" } | { status: "UNKNOWN_TENANT_ERROR" }> => {
		return await Implementation.getInstanceOrThrow().deleteThirdPartyProvider({
			tenantId,
			providerId,
			fetchData,
			getApiUrl,
		});
	};

	return deleteThirdPartyProvider;
};
