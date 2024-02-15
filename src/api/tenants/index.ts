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

import { CORE_CONFIG_PROPERTIES } from "../../constants";
import { getApiUrl, useFetchData } from "../../utils";
import { CoreConfigOptions, TenantInfo, UpdateTenant } from "./types";

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
				status: "MULTITENANCY_NOT_ENABLED_ERROR";
		  }
		| {
				status: "INVALID_TENANT_ID_ERROR";
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

		if (response.status === 500) {
			const text = await response.text();
			if (text.includes(`Cannot use '${tenantId}' as a tenantId`)) {
				return {
					status: "INVALID_TENANT_ID_ERROR",
					message: `Cannot use '${tenantId}' as a Tenant Id.`,
				};
			}
		}

		return undefined;
	};

	return createOrUpdateTenant;
};

export const useCoreConfigService = () => {
	const fetchData = useFetchData();

	const getCoreConfigOptions = async (): Promise<{
		status: "OK";
		config: CoreConfigOptions;
	}> => {
		// TODO: Uncomment the following code after the API is implemented
		// const response = await fetchData({
		// 	url: getApiUrl("/multitenancy/core-config/list"),
		// 	method: "GET",
		// });

		// if (response.ok) {
		// 	const body = await response.json();
		// 	return body;
		// }

		// throw new Error("Cannot fetch core config options");

		return {
			status: "OK",
			config: CORE_CONFIG_PROPERTIES as CoreConfigOptions,
		};
	};

	return {
		getCoreConfigOptions,
	};
};

export const useTenantService = () => {
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
			url: getApiUrl(`/api/tenant?tenantId=${tenantId}`),
			method: "GET",
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};

	const updateTenant = async (
		tenantId: string,
		tenantInfo: UpdateTenant
	): Promise<{
		status: "OK";
	}> => {
		const response = await fetchData({
			url: getApiUrl("/api/tenant"),
			method: "PUT",
			config: {
				body: JSON.stringify({ ...tenantInfo, tenantId }),
			},
		});

		if (response.ok) {
			return {
				status: "OK",
			};
		}

		throw new Error("Unknown error");
	};

	return {
		getTenantInfo,
		updateTenant,
	};
};
