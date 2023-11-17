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

type GetRolesResponse =
	| {
			status: "OK";
			roles: string[];
	  }
	| {
			status: "FEATURE_NOT_ENABLED_ERROR";
	  };

export const useRolesService = () => {
	const fetchData = useFetchData();

	const getRoles = async (): Promise<GetRolesResponse | undefined> => {
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

	const createRoleOrUpdateARole = async (
		role: string,
		permissions: string[]
	): Promise<
		| { status: "OK"; createdNewRole: boolean }
		| { status: "FEATURE_NOT_ENABLED_ERROR" | "UNKNOWN_ROLE_ERROR" }
		| undefined
	> => {
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

	const deleteRole = async (
		role: string
	): Promise<
		| {
				status: "OK";
				didRoleExist: boolean;
		  }
		| {
				status: "FEATURE_NOT_ENABLED_ERROR";
		  }
		| undefined
	> => {
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

	return {
		getRoles,
		createRoleOrUpdateARole,
		deleteRole,
	};
};

export default useRolesService;
