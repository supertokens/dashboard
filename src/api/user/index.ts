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

import { User } from "@features/users/types";
import { getApiUrl, useFetchData } from "@shared/utils";
import { Implementation } from "../../implementation";

interface IUseUserService {
	updateUserInformation: (args: IUpdateUserInformationArgs) => Promise<UpdateUserInformationResponse>;
	getUser: (userId: string) => Promise<GetUserInfoResult>;
}

export interface IUpdateUserInformationArgs {
	userId: string;
	recipeId: string;
	recipeUserId: string;
	tenantId: string | undefined;
	email?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;
}

export type GetUserInfoResult =
	| {
			status: "NO_USER_FOUND_ERROR";
	  }
	| {
			status: "RECIPE_NOT_INITIALISED";
	  }
	| {
			status: "OK";
			user: User;
	  };

export type UpdateUserInformationResponse =
	| {
			status: "OK" | "EMAIL_ALREADY_EXISTS_ERROR" | "PHONE_ALREADY_EXISTS_ERROR";
	  }
	| {
			status: "INVALID_EMAIL_ERROR" | "INVALID_PHONE_ERROR";
			error: string;
	  };

export const useUserService = (): IUseUserService => {
	const fetchData = useFetchData();

	const getUser = async (userId: string): Promise<GetUserInfoResult> => {
		return await Implementation.getInstanceOrThrow().getUser({ userId, fetchData, getApiUrl });
	};

	const updateUserInformation = async ({
		userId,
		recipeId,
		recipeUserId,
		email,
		phone,
		firstName,
		lastName,
		tenantId,
	}: IUpdateUserInformationArgs): Promise<UpdateUserInformationResponse> => {
		return await Implementation.getInstanceOrThrow().updateUserInformation({
			userId,
			recipeId,
			recipeUserId,
			email,
			phone,
			firstName,
			lastName,
			tenantId,
			fetchData,
			getApiUrl,
		});
	};

	return {
		updateUserInformation,
		getUser,
	};
};

export default useUserService;
