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
import { HTTPStatusCodes, StorageKeys } from "@shared/constants";
import { getApiUrl, useFetchData } from "@shared/utils";
import { Implementation } from "../../../implementation";

export const useApiKeyValidation = (onSuccess: () => void) => {
	const [apiKeyFieldError, setApiKeyFieldError] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [loading, setIsLoading] = useState<boolean>(false);
	const fetchData = useFetchData();
	const localStorageHandler = Implementation.getInstanceOrThrow().getLocalStorageHandler();

	const validateKey = async () => {
		setIsLoading(true);
		const response = await fetchData({
			url: getApiUrl("/api/key/validate"),
			method: "POST",
			config: {
				headers: {
					authorization: `Bearer ${apiKey}`,
				},
			},
			shouldRedirectOnUnauthorised: false,
		});

		const body = await response.json();

		if (response.status === 200 && body.status === "OK") {
			localStorageHandler.setItem(StorageKeys.AUTH_KEY, apiKey);
			onSuccess();
		} else if (response.status === HTTPStatusCodes.UNAUTHORIZED) {
			setApiKeyFieldError("Invalid API Key");
		} else {
			setApiKeyFieldError("Something went wrong");
		}

		setIsLoading(false);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setApiKeyFieldError("");

		if (apiKey !== null && apiKey !== undefined && apiKey.length > 0) {
			void validateKey();
		} else {
			setApiKeyFieldError("API Key field cannot be empty");
		}
	};

	const handleApiKeyFieldChange = (
		e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setApiKeyFieldError("");
		setApiKey(e.target.value);
	};

	return {
		apiKey,
		apiKeyFieldError,
		loading,
		handleSubmit,
		handleApiKeyFieldChange,
	};
};
