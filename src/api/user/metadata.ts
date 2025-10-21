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

interface IUseMetadataService {
	getUserMetaData: (userId: string) => Promise<string | any>;
	updateUserMetaData: (userId: string, data: string) => Promise<any>;
}

const useMetadataService = (): IUseMetadataService => {
	const fetchData = useFetchData();

	const getUserMetaData = async (userId: string): Promise<string | any> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/metadata"),
			method: "GET",
			query: {
				userId,
			},
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status === "FEATURE_NOT_ENABLED_ERROR") {
				return "FEATURE_NOT_ENABLED_ERROR";
			}

			if (body.status !== "OK") {
				return undefined;
			}

			return body.data;
		}

		return undefined;
	};

	const updateUserMetaData = async (userId: string, data: string) => {
		data = data.replaceAll("\n", "");
		const response = await fetchData({
			url: getApiUrl("/api/user/metadata"),
			method: "PUT",
			config: {
				body: JSON.stringify({
					userId,
					data,
				}),
			},
		});

		if (response.status === 200) {
			return await response.json();
		}

		if (response.status === 400) {
			throw new Error("Invalid meta data");
		}

		throw new Error("Something went wrong");
	};

	return {
		getUserMetaData,
		updateUserMetaData,
	};
};

export default useMetadataService;
