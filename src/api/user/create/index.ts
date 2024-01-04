/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
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

import { User } from "../../../ui/pages/usersList/types";
import { getApiUrl, useFetchData } from "../../../utils";

export type CreatePasswordlessUserPayload = {
	email?: string;
	phoneNumber?: string;
};

interface ICreateUserService {
	createEmailPasswordUser: (
		tenantId: string,
		email: string,
		password: string
	) => Promise<CreateEmailPasswordUserResponse>;
	createPasswordlessUser: (
		tenantId: string,
		data: CreatePasswordlessUserPayload
	) => Promise<CreatePasswordlessUserResponse>;
}

type CreateEmailPasswordUserResponse =
	| {
			status: "OK";
			user: User;
			recipeUserId: string;
	  }
	| {
			status: "EMAIL_ALREADY_EXISTS_ERROR" | "FEATURE_NOT_ENABLED_ERROR";
	  }
	| {
			status: "EMAIL_VALIDATION_ERROR";
			message: string;
	  }
	| {
			status: "PASSWORD_VALIDATION_ERROR";
			message: string;
	  };

type CreatePasswordlessUserResponse =
	| {
			status: "OK";
			createdNewRecipeUser: boolean;
			user: User;
			recipeUserId: string;
	  }
	| {
			status: "FEATURE_NOT_ENABLED_ERROR";
	  }
	| {
			status: "EMAIL_VALIDATION_ERROR";
			message: string;
	  }
	| {
			status: "PHONE_VALIDATION_ERROR";
			message: string;
	  };

const useCreateUserService = (): ICreateUserService => {
	const fetchData = useFetchData(true);

	const createEmailPasswordUser = async (
		tenantId: string | undefined,
		email: string,
		password: string
	): Promise<CreateEmailPasswordUserResponse> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/emailpassword", tenantId),
			method: "POST",
			config: {
				body: JSON.stringify({
					email,
					password,
				}),
			},
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Something went wrong!");
	};

	const createPasswordlessUser = async (
		tenantId: string,
		data: {
			email?: string;
			phoneNumber?: string;
		}
	): Promise<CreatePasswordlessUserResponse> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/passwordless", tenantId),
			method: "POST",
			config: {
				body: JSON.stringify({
					...data,
				}),
			},
		});

		if (response.ok) {
			return await response.json();
		}

		throw new Error("Something went wrong!");
	};

	return { createEmailPasswordUser, createPasswordlessUser };
};

export default useCreateUserService;
