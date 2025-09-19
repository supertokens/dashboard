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
import useCreateUserService from "@api/user/create";
import { getApiUrl } from "@utils";
import { CreateUserDialogStepType } from "./CreateUserDialog";
import Form from "@components/radix/form";
import { Modal } from "@components/radix/modal";
import TextField from "@components/radix/text";
import Label from "@components/radix/label";
import { Flex } from "@radix-ui/themes";
import Button from "@components/radix/button";
import Paper from "@components/radix/paper";
import { useToast } from "@components/radix/toast";

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
	const { showErrorToast, showSuccessToast } = useToast();

	function handleEmailValidationError(response: { message: string }): void {
		setEmailValidationErrorMessage(response.message);
	}

	function handlePasswordValidationError(response: { message: string }): void {
		setPasswordValidationErrorMessage(response.message);
	}

	function resetForm(): void {
		setEmail("");
		setPassword("");
	}

	function handleUserCreationSuccess(userId: string): void {
		showSuccessToast("User created successfully!");
		resetForm();
		loadCount();
		window.open(getApiUrl(`?userid=${userId}`), "_blank");
	}

	async function createUser(e: React.FormEvent<HTMLFormElement | HTMLButtonElement>) {
		e.preventDefault();
		setIsCreatingUser(true);

		try {
			// Note: We're intentionally skipping frontend input validation in favor of users' defined custom validators running on the backend.

			const response = await createEmailPasswordUser(tenantId, email, password);

			// Handle email already exists error
			if (response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
				showErrorToast(`User with this email already exists in ${tenantId} tenant.`);
				return;
			}

			// Handle validation errors
			if (response.status === "EMAIL_VALIDATION_ERROR") {
				handleEmailValidationError(response);
				return;
			}

			if (response.status === "PASSWORD_VALIDATION_ERROR") {
				handlePasswordValidationError(response);
				return;
			}

			// Handle feature not enabled error
			if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
				showErrorToast("Feature not enabled!");
				return;
			}

			// Handle successful creation
			if (response.status === "OK") {
				handleUserCreationSuccess(response.user.id);
			}
		} catch (_) {
			showErrorToast("Something went wrong, please try again!");
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
		<Modal
			title="Create User"
			handleClose={onCloseDialog}
			open={true}>
			<Paper withBackground>
				{" "}
				<Form>
					<Form.Item>
						<Label
							title="Email"
							htmlFor="email"
						/>
						<TextField
							value={email}
							onChange={(e) => setEmail(e.currentTarget.value)}
							error={emailValidationErrorMessage}
						/>
					</Form.Item>
					<Form.Item>
						<Label
							title="Password"
							htmlFor="password"
						/>
						<TextField
							value={password}
							onChange={(e) => setPassword(e.currentTarget.value)}
							type="password"
							error={passwordValidationErrorMessage}
						/>
					</Form.Item>
				</Form>
			</Paper>
			<Flex
				justify="end"
				gap="4"
				mt="4">
				<Button
					onClick={() => {
						setCurrentStep("select-auth-method-and-tenant");
					}}
					type="button"
					variant="outline">
					Go Back
				</Button>
				<Button
					type="submit"
					onClick={createUser}
					isLoading={isCreatingUser}
					disabled={isCreatingUser}>
					Create
				</Button>
			</Flex>
		</Modal>
	);
}
