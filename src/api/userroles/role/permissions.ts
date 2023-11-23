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

import { getApiUrl, useFetchData } from "../../../utils";

export const usePermissionsService = () => {
	const fetchData = useFetchData();

	const getPermissionsForRole = async (
		role: string
	): Promise<
		| {
				status: "OK";
				permissions: string[];
		  }
		| { status: "FEATURE_NOT_ENABLED_ERROR" | "UNKNOWN_ROLE_ERROR" }
		| undefined
	> => {
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

	const removePermissionsFromRole = async (
		role: string,
		permissions: string[]
	): Promise<
		| {
				status: "OK" | "UNKNOWN_ROLE_ERROR" | "FEATURE_NOT_ENABLED_ERROR";
		  }
		| undefined
	> => {
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

	return {
		getPermissionsForRole,
		removePermissionsFromRole,
	};
};
