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

import { LIST_DEFAULT_LIMIT } from "../../ui/components/usersListTable/UsersListTable";
import { UserPaginationList } from "../../ui/pages/usersList/types";
import { getApiUrl, useFetchData } from "../../utils";

interface IUseFetchUsersService {
	fetchUsers: (
		param?: { paginationToken?: string; limit?: number },
		search?: object,
		tenantId?: string
	) => Promise<UserPaginationList | undefined>;
}

export const useFetchUsersService = (): IUseFetchUsersService => {
	const fetchData = useFetchData();
	const fetchUsers = async (
		param?: { paginationToken?: string; limit?: number },
		search?: object,
		tenantId?: string
	) => {
		let query = {};
		if (search) {
			query = { ...search };
		}
		if (param && Object.keys(param).includes("paginationToken")) {
			query = { ...query, paginationToken: param?.paginationToken };
		}
		if (param && Object.keys(param).includes("limit")) {
			query = { ...query, limit: param?.limit };
		} else {
			query = { ...query, limit: LIST_DEFAULT_LIMIT };
		}
		const response = await fetchData({
			url: getApiUrl("/api/users", tenantId),
			method: "GET",
			query: query,
		});
		return response.ok ? ((await response?.json()) as UserPaginationList) : undefined;
	};
	return { fetchUsers };
};

export default useFetchUsersService;
