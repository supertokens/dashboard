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

import { getApiUrl, useFetchData } from "@shared/utils";

interface IUseVerifyUserTokenService {
	sendUserEmailVerification: (userId: string, tenantId?: string) => Promise<boolean>;
}

const useVerifyUserTokenService = (): IUseVerifyUserTokenService => {
	const fetchData = useFetchData();

	const sendUserEmailVerification = async (userId: string, tenantId?: string) => {
		const response = await fetchData({
			url: getApiUrl("/api/user/email/verify/token", tenantId),
			method: "POST",
			config: {
				body: JSON.stringify({
					recipeUserId: userId,
				}),
			},
		});
		return response?.ok;
	};

	return { sendUserEmailVerification };
};

export default useVerifyUserTokenService;
