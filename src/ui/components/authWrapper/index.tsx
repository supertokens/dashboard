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

import { useEffect, useState } from "react";
import { StorageKeys } from "../../../constants";
import { localStorageHandler } from "../../../services/storage";
import Auth from "../auth/Auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AuthWrapper(props: { children: any }) {
	const [shouldShowAuthForm, setShouldShowAuthForm] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const apiKey = localStorageHandler.getItem(StorageKeys.AUTH_KEY);
		const _shouldShowAuthForm = apiKey === undefined;

		if (_shouldShowAuthForm) {
			localStorageHandler.removeItem(StorageKeys.AUTH_KEY);
			localStorageHandler.removeItem(StorageKeys.EMAIL);
		}

		setShouldShowAuthForm(_shouldShowAuthForm);
		setIsLoading(false);
	}, []);

	if (isLoading) {
		return <></>;
	}

	if (shouldShowAuthForm) {
		return (
			<Auth
				onSuccess={() => {
					setShouldShowAuthForm(false);
				}}
			/>
		);
	}

	return props.children;
}
