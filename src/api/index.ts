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

import { useState } from "react";
import { StorageKeys } from "@shared/constants";
import { localStorageHandler } from "@shared/services/storage";
import { getApiUrl, useFetchData } from "@shared/utils";

const useAuthService = () => {
	const fetchData = useFetchData();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const logout = async () => {
		setIsLoading(true);
		try {
			const response = await fetchData({
				url: getApiUrl("/api/signout"),
				method: "POST",
			});
			const body = await response.json();
			if (body.status === "OK") {
				localStorageHandler.removeItem(StorageKeys.AUTH_KEY);
				localStorageHandler.removeItem(StorageKeys.EMAIL);
				window.location.reload();
			}
		} finally {
			setIsLoading(false);
		}
	};

	const signIn = async ({ email, password }: { email: string; password: string }) => {
		setIsLoading(true);
		try {
			return await fetchData({
				url: getApiUrl("/api/signin"),
				method: "POST",
				config: {
					body: JSON.stringify({
						email,
						password,
					}),
				},
			});
		} finally {
			setIsLoading(false);
		}
	};

	return {
		logout,
		signIn,
		isLoading,
	};
};

export default useAuthService;
