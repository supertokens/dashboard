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

type Roles = Array<{ role: string; permissions: string[] }>;

type GetRolesResponse =
	| {
			status: "OK";
			roles: Roles;
	  }
	| {
			status: "FEATURE_NOT_ENABLED_ERROR";
	  };

export const useRolesService = () => {
	const fetchData = useFetchData();

	const getRoles = async (): Promise<GetRolesResponse> => {
		const response = await fetchData({
			url: getApiUrl("/api/userroles/roles"),
			method: "GET",
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status === "FEATURE_NOT_ENABLED_ERROR") {
				return {
					status: "FEATURE_NOT_ENABLED_ERROR",
				};
			}

			return body;
		}

		return {
			status: "OK",
			roles: [],
		};
	};

	const createRole = async (
		role: string,
		permissions: string[]
	): Promise<{
		status: "OK" | "ROLE_ALREADY_EXITS";
	}> => {
		const response = await fetchData({
			url: getApiUrl("/api/userroles/role"),
			method: "POST",
			config: {
				body: JSON.stringify({
					role,
					permissions,
				}),
			},
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status === "ROLE_ALREADY_EXITS") {
				return {
					status: "ROLE_ALREADY_EXITS",
				};
			}
		}

		return {
			status: "OK",
		};
	};

	const deleteRole = async (role: string): Promise<void> => {
		await fetchData({
			url: getApiUrl("/api/userroles/role"),
			method: "DELETE",
			query: {
				role,
			},
		});
	};

	return {
		getRoles,
		createRole,
		deleteRole,
	};
};

export default useRolesService;
