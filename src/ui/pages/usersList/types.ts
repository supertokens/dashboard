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
	users: User[];
};

// Users Models
export type EmailPasswordRecipeId = "emailpassword";
export type ThirdPartyRecipeId = "thirdparty";
export type PasswordlessRecipeId = "passwordless";

export type UserRecipeType = EmailPasswordRecipeId | ThirdPartyRecipeId | PasswordlessRecipeId | "multiple";

export type LoginMethod = {
	timeJoined: number;
	recipeUserId: string;
	recipeId: EmailPasswordRecipeId | PasswordlessRecipeId | ThirdPartyRecipeId;
	email?: string;
	phoneNumber?: string;
	thirdParty?: {
		id: string;
		userId: string;
	};
	verified: boolean;
	tenantIds: string[];
};

export type User = {
	id: string;
	timeJoined: number;
	emails: string[];
	phoneNumbers: string[];
	thirdParty: {
		id: string;
		userId: string;
	}[];
	loginMethods: LoginMethod[];
	firstName?: string;
	lastName?: string;
	tenantIds: string[];
	isPrimaryUser: boolean;
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

export type UserProps = { user: User };

export const FEATURE_NOT_ENABLED_TEXT = "FEATURE_NOT_ENABLED_ERROR";

export type EmailVerificationStatus =
	| {
			status: typeof FEATURE_NOT_ENABLED_TEXT;
	  }
	| {
			status: "OK";
			isVerified: boolean;
	  };
