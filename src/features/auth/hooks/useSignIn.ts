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

import { useEffect, useState } from "react";
import useAuthService from "@api";
import { HTTPStatusCodes, StorageKeys } from "@shared/constants";
import { localStorageHandler } from "@shared/services/storage";
import { validateEmail } from "@shared/utils/form";

interface IErrorObject {
	email: string;
	password: string;
}

export const useSignIn = (onSuccess: () => void) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [userTriedToSubmit, setUserTriedToSubmit] = useState(false);
	const { signIn } = useAuthService();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [errors, setErrors] = useState<IErrorObject>({
		email: "",
		password: "",
	});
	const [serverValidationError, setServerValidationError] = useState("");

	const validateCredentials = async () => {
		const response = await signIn({ email, password });
		const body = await response.json();
		if (response.status === HTTPStatusCodes.OK) {
			switch (body.status) {
				case "OK":
					localStorageHandler.setItem(StorageKeys.AUTH_KEY, body.sessionId);
					localStorageHandler.setItem(StorageKeys.EMAIL, email);
					onSuccess();
					break;
				case "USER_LIMIT_REACHED_ERROR":
					setServerValidationError(body.message);
					break;
				case "USER_SUSPENDED_ERROR":
					setServerValidationError(
						"User is currently suspended. Please sign in with another account, or reactivate the SuperTokens core license key."
					);
					break;
				default:
					setServerValidationError("Incorrect email and password combination");
					break;
			}
		} else {
			setServerValidationError("Something went wrong");
		}
	};

	const checkValuesForErrors = () => {
		const _errors: IErrorObject = {
			email: "",
			password: "",
		};
		if (!email) _errors.email = "Email cannot be empty";
		if (!password) _errors.password = "Password cannot be empty";
		if (!validateEmail(email)) _errors.email = "Email is invalid";
		setErrors(_errors);
		return Object.values(_errors).some((error) => error);
	};

	const clearErrors = (key: keyof IErrorObject) => {
		setErrors({ ...errors, [key]: "" });
		setServerValidationError("");
	};

	useEffect(() => {
		if (email && errors.email) clearErrors("email");
	}, [email]);

	useEffect(() => {
		if (password && errors.password) clearErrors("password");
	}, [password]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setServerValidationError("");
		setUserTriedToSubmit(true);
		const hasErrors = checkValuesForErrors();
		if (hasErrors) {
			setIsLoading(false);
			return;
		}
		await validateCredentials();
		setIsLoading(false);
	};

	const handleEmailFieldChange = (
		e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setEmail(e.target.value);
	};

	const handlePasswordFieldChange = (
		e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setPassword(e.target.value);
	};

	return {
		isLoading,
		userTriedToSubmit,
		email,
		password,
		errors,
		serverValidationError,
		handleSubmit,
		handleEmailFieldChange,
		handlePasswordFieldChange,
	};
};
