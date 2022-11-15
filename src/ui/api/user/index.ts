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

export const getUser = async (userId: string, recipeId: string): Promise<UserWithRecipeId | undefined> => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user"),
		method: "GET",
		query: {
			userId,
			recipeId,
		},
	});

	if (response.ok) {
		const body = await response.json();

		if (body.status !== "OK") {
			return undefined;
		}

		return body;
	}

	return undefined;
};

export type UpdateUserInformationResponse =
	| {
			status: "OK" | "EMAIL_ALREADY_EXISTS_ERROR" | "PHONE_ALREADY_EXISTS_ERROR";
	  }
	| {
			status: "INVALID_EMAIL_ERROR" | "INVALID_PHONE_ERROR";
			error: string;
	  };

export const updateUserInformation = async ({
	userId,
	recipeId,
	email,
	phone,
	firstName,
	lastName,
}: {
	userId: string;
	recipeId: string;
	email?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;
}): Promise<UpdateUserInformationResponse> => {
	const emailToSend = email === undefined ? "" : email;
	const phoneToSend = phone === undefined ? "" : phone;
	const firstNameToSend = firstName === undefined ? "" : firstName;
	const lastNameToSend = lastName === undefined ? "" : lastName;

	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user"),
		method: "PUT",
		config: {
			body: JSON.stringify({
				recipeId,
				userId,
				phone: phoneToSend,
				email: emailToSend,
				firstName: firstNameToSend,
				lastName: lastNameToSend,
			}),
		},
	});

	return await response.json();
};
