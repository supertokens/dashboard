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

import React, { useEffect, useState } from "react";
import { StorageKeys } from "@shared/constants";
import { localStorageHandler } from "@shared/services/storage";
import Loader from "@shared/components/loader";
import Auth from "./Auth";
import { withOverride } from "@plugins";

interface AuthWrapperProps {
	children: React.ReactNode;
}

const AuthWrapper = withOverride("AuthWrapper", function AuthWrapper({ children }: AuthWrapperProps): JSX.Element {
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
		return <Loader type="page" />;
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

	return <>{children}</>;
});

export default AuthWrapper;
