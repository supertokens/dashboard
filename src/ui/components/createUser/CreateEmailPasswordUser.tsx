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

import { useContext, useEffect, useState } from "react";
import useCreateUserService from "../../../api/user/create";
import { getApiUrl, getImageUrl } from "../../../utils";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import Button from "../button";
import { Dialog, DialogContent, DialogFooter } from "../dialog";
import InputField from "../inputField/InputField";
import { CreateUserDialogStepType } from "./CreateUserDialog";

type CreateEmailPasswordUserProps = {
	tenantId: string;
	onCloseDialog: () => void;
	loadCount: () => void;
	setCurrentStep: (step: CreateUserDialogStepType) => void;
};

export default function CreateEmailPasswordUser({
	tenantId,
	onCloseDialog,
	setCurrentStep,
	loadCount,
}: CreateEmailPasswordUserProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isCreatingUser, setIsCreatingUser] = useState(false);

	const [emailValidationErrorMessage, setEmailValidationErrorMessage] = useState<string | undefined>(undefined);
	const [passwordValidationErrorMessage, setPasswordValidationErrorMessage] = useState<string | undefined>(undefined);

	const { createEmailPasswordUser } = useCreateUserService();
	const { showToast } = useContext(PopupContentContext);

	async function createUser(e: React.FormEvent<HTMLFormElement | HTMLButtonElement>) {
		e.preventDefault();
		setIsCreatingUser(true);
		try {
			// Note: We're intentionally skipping frontend input validation in favor of users' defined custom validators running on the backend.

			const response = await createEmailPasswordUser(tenantId, email, password);
			if (response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>User with this email already exists in {tenantId} tenant.</>,
				});
				return;
			}

			if (response.status === "EMAIL_VALIDATION_ERROR") {
				setEmailValidationErrorMessage(response.message);
				return;
			}

			if (response.status === "PASSWORD_VALIDATION_ERROR") {
				setPasswordValidationErrorMessage(response.message);
				return;
			}

			if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Feature not enabled!</>,
				});
			}

			if (response.status === "OK") {
				showToast({
					iconImage: getImageUrl("checkmark-green.svg"),
					toastType: "success",
					children: <>User created successfully!</>,
				});
				setEmail("");
				setPassword("");
				loadCount();
				window.open(getApiUrl(`?userid=${response.user.id}`), "_blank");
			}
		} catch (_) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong, please try again!</>,
			});
		} finally {
			setIsCreatingUser(false);
		}
	}

	useEffect(() => {
		setEmailValidationErrorMessage(undefined);
	}, [email]);

	useEffect(() => {
		setPasswordValidationErrorMessage(undefined);
	}, [password]);

	return (
		<Dialog
			className="max-width-436"
			title="Email Password sign up"
			onCloseDialog={onCloseDialog}>
			<DialogContent className="text-small text-semi-bold">
				<form
					onSubmit={createUser}
					className="dialog-form-content-container pb-0">
					<InputField
						error={emailValidationErrorMessage}
						label="Email"
						hideColon
						value={email}
						handleChange={(e) => {
							setEmail(e.currentTarget.value);
						}}
						name="email"
						type="email"
					/>
					<InputField
						error={passwordValidationErrorMessage}
						label="Password"
						hideColon
						value={password}
						handleChange={(e) => {
							setPassword(e.currentTarget.value);
						}}
						name="password"
						type="password"
					/>
					<DialogFooter
						border="border-top"
						className="mt-10">
						<Button
							type="button"
							color="gray-outline"
							onClick={() => {
								setCurrentStep("select-auth-method-and-tenant");
							}}>
							Go Back
						</Button>
						<Button
							type="submit"
							onClick={createUser}
							isLoading={isCreatingUser}
							disabled={isCreatingUser}>
							Create
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
