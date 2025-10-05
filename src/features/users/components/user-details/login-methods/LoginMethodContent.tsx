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

import { LoginMethod } from "@features/users/types";

import EmailPasswordLoginMethodContent from "./EmailPasswordLoginMethodContent";
import PasswordlessLoginMethodContent from "./PasswordlessLoginMethodContent";
import ThirdPartyLoginMethodContent from "./ThirdPartyLoginMethodContent";

interface LoginMethodContentProps {
	readonly loginMethod: LoginMethod;
	readonly userId: string;
	readonly onEditClick: () => void;
}

export default function LoginMethodContent({ loginMethod, userId, onEditClick }: LoginMethodContentProps) {
	switch (loginMethod.recipeId) {
		case "emailpassword":
			return (
				<EmailPasswordLoginMethodContent
					loginMethod={loginMethod}
					userId={userId}
					onEditClick={onEditClick}
				/>
			);
		case "passwordless":
			return (
				<PasswordlessLoginMethodContent
					loginMethod={loginMethod}
					userId={userId}
					onEditClick={onEditClick}
				/>
			);
		case "thirdparty":
			return (
				<ThirdPartyLoginMethodContent
					loginMethod={loginMethod}
					userId={userId}
				/>
			);
		default:
			return null;
	}
}
