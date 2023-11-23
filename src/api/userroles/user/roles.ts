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

export type UserRolesResponse =
	| {
			status: "OK";
			roles: string[];
	  }
	| {
			status: "FEATURE_NOT_ENABLED_ERROR";
	  };

export const useUserRolesService = () => {
	const fetchData = useFetchData();

	const addRoleToUser = async (
		userId: string,
		role: string,
		tenantId: string
	): Promise<
		| {
				status: "OK" | "UNKNOWN_ROLE_ERROR";
		  }
		| undefined
	> => {
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

	const getRolesForUser = async (userId: string, tenantId: string): Promise<UserRolesResponse | undefined> => {
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

	const removeUserRole = async (
		userId: string,
		role: string,
		tenantId: string
	): Promise<
		| {
				status: "OK";
		  }
		| {
				status: "UNKNOWN_ROLE_ERROR";
		  }
		| undefined
	> => {
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

	return {
		addRoleToUser,
		getRolesForUser,
		removeUserRole,
	};
};
