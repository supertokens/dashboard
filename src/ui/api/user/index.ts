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

import { fetchDataAndRedirectIf401, getApiUrl } from "../../../utils";
import { UserWithRecipeId } from "../../pages/usersList/types";

export const getUser = async (userId: string) => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl(`/api/user/${userId}`),
		method: "GET",
	});
	return response?.ok ? ((await response.json()) as UserWithRecipeId) : undefined;
};

export const updateUser = async (userId: string, updatedData: UserWithRecipeId) => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl(`/api/user/${userId}`),
		method: "PUT",
		config: {
			body: JSON.stringify(updatedData),
		},
	});
	return response?.ok;
};

export const deleteUser = async (userId: string) => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl(`/api/user/${userId}`),
		method: "DELETE",
	});
	return response?.ok;
};

export default updateUser;
