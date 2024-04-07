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
import { ProviderConfig, TenantInfo } from "./types";

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

		if (response.ok) {
			return {
				status: "OK",
			};
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
			return {
				status: "OK",
			};
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
			return {
				status: "OK",
			};
		}

		throw new Error("Unknown error");
	};

	return updateSecondaryFactors;
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
