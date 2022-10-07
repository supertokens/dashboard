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

import { HttpApiBaseResponse } from "../../../types";

export type UserListCount = HttpApiBaseResponse & { count: number };
export type UserPaginationList = HttpApiBaseResponse & {
	nextPaginationToken?: string;
	users: UserWithRecipeId[];
};

// Users Models
export type EmailPasswordRecipeId = "emailpassword";
export type ThirdPartyRecipeId = "thirdparty";
export type PasswordlessRecipeId = "passwordless";

export type UserRecipeType = EmailPasswordRecipeId | ThirdPartyRecipeId | PasswordlessRecipeId;

export type UserWithRecipeId =
	| { recipeId: EmailPasswordRecipeId; user: UserEmailPassword }
	| { recipeId: PasswordlessRecipeId; user: UserPasswordLess }
	| { recipeId: ThirdPartyRecipeId; user: UserThirdParty };

export type User = {
	id: string;
	email?: string;
	timeJoined: number;
	firstName?: string;
	lastName?: string;
};

export type UserEmailPassword = User;

export type UserPasswordLess = User & { phoneNumber?: string };

export type UserThirdParty = User & {
	thirdParty: {
		id: "google" | "github" | "apple" | "facebook" | string;
		userId: string;
	};
};

export type UserFeatureStatus = {
	firstName: boolean;
	lastName: boolean;
	emailVerification: boolean;
};

export type UserProps = { user: UserWithRecipeId };

export const FEATURE_NOT_ENABLED_TEXT = "FEATURE_NOT_ENABLED";

export type EmailVerificationStatus = {
	status: "OK" | typeof FEATURE_NOT_ENABLED_TEXT;
	isVerified: boolean;
};
