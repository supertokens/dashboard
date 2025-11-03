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

import { EmailVerificationStatus } from "@features/auth/types";
import { getApiUrl, useFetchData } from "@shared/utils";

interface IUseVerifyUserEmailService {
	getUserEmailVerificationStatus: (userId: string) => Promise<EmailVerificationStatus>;
	updateUserEmailVerificationStatus: (
		userId: string,
		isEmailVerified: boolean,
		tenantId: string | undefined
	) => Promise<boolean>;
}

const useVerifyUserEmail = (): IUseVerifyUserEmailService => {
	const fetchData = useFetchData();

	const getUserEmailVerificationStatus = async (userId: string): Promise<EmailVerificationStatus> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify"),
			method: "GET",
			query: { recipeUserId: userId },
		});

		const body = await response.json();
		return body;
	};

	const updateUserEmailVerificationStatus = async (
		userId: string,
		isEmailVerified: boolean,
		tenantId: string | undefined
	) => {
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify", tenantId),
			method: "PUT",
			config: {
				body: JSON.stringify({ verified: isEmailVerified, recipeUserId: userId }),
			},
		});
		return response?.ok;
	};

	return {
		getUserEmailVerificationStatus,
		updateUserEmailVerificationStatus,
	};
};

export default useVerifyUserEmail;
