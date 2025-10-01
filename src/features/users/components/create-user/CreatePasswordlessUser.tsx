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
import { PasswordlessContactMethod } from "@api/tenants/types";
import useCreateUserService, { CreatePasswordlessUserPayload } from "@api/user/create";
import { getApiUrl } from "@utils";
import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import { assertNever } from "@utils/assertNever";
import Label from "@shared/components/label";
import TextField from "@shared/components/text";
import { Flex } from "@radix-ui/themes";
import Button from "@shared/components/button";
import PhoneNumberInput from "@shared/components/phoneNumberInput";
import Paper from "@shared/components/paper";
import { useToast } from "@shared/components/toast";
import { CreateUserDialogStepType } from "@shared/components/modals/create-user";

type CreatePasswordlessUserProps = {
	tenantId: string;
	authMethod: PasswordlessContactMethod | undefined;
	onCloseDialog: () => void;
	setCurrentStep: (step: CreateUserDialogStepType) => void;
	loadCount: () => void;
};

function isNumber(value: string): boolean {
	const trimmedString = value.replaceAll(/\s/g, "").trim();

	// added this check since parsing a empty string to a number returns 0.
	if (trimmedString.length < 1) {
		return false;
	}

	return isNaN(Number(trimmedString)) === false;
}

export default function CreatePasswordlessUser({
	tenantId,
	authMethod,
	onCloseDialog,
	setCurrentStep,
	loadCount,
}: CreatePasswordlessUserProps) {
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [emailOrPhone, setEmailOrPhone] = useState("");

	const [formErrorMessage, setFormErrorMessage] = useState<string | undefined>(undefined);

	const [isCreatingUser, setIsCreatingUser] = useState(false);
	const [isPhoneNumber, setIsPhoneNumber] = useState(false);

	const { createPasswordlessUser } = useCreateUserService();
	const { showErrorToast, showSuccessToast } = useToast();

	function buildPayload(): CreatePasswordlessUserPayload | null {
		const payload: CreatePasswordlessUserPayload = {};

		// Note: We're intentionally skipping frontend input validation in favor of user defined custom validators running on the backend.

		if (authMethod === "EMAIL") {
			payload.email = email;
		} else if (authMethod === "PHONE") {
			payload.phoneNumber = phoneNumber;
		} else if (authMethod === "EMAIL_OR_PHONE") {
			if (isNumber(emailOrPhone) === true) {
				const normalisedPhoneNumber =
					emailOrPhone.startsWith("+") === false ? "+" + emailOrPhone : emailOrPhone;
				payload.phoneNumber = normalisedPhoneNumber;
				setEmailOrPhone(normalisedPhoneNumber);
				setIsPhoneNumber(true);
			} else {
				payload.email = emailOrPhone;
			}
		} else {
			showErrorToast("No matching auth method found!");
			return null;
		}

		return payload;
	}

	function getExistingUserErrorMessage(): string {
		if (authMethod === "EMAIL") {
			return "User with this email already exists!";
		} else if (authMethod === "PHONE") {
			return "User with this phone number already exists!";
		} else {
			return isNumber(emailOrPhone) === false
				? "User with this email already exists!"
				: "User with this phone number already exists!";
		}
	}

	function handleValidationError(response: { status: string; message: string }): void {
		if (
			authMethod === "EMAIL_OR_PHONE" &&
			response.status === "EMAIL_VALIDATION_ERROR" &&
			isNumber(emailOrPhone) === false
		) {
			setFormErrorMessage("Please enter a valid email or phone number.");
		} else {
			setFormErrorMessage(response.message);
		}
	}

	function resetForm(): void {
		setEmail("");
		setPhoneNumber("");
		setEmailOrPhone("");
	}

	async function createUser(e: React.FormEvent<HTMLFormElement | HTMLButtonElement>) {
		e.preventDefault();
		setIsCreatingUser(true);
		setFormErrorMessage(undefined);

		try {
			const payload = buildPayload();
			if (!payload) {
				return;
			}

			const response = await createPasswordlessUser(tenantId, payload);

			// Handle validation errors
			if (response.status === "EMAIL_VALIDATION_ERROR" || response.status === "PHONE_VALIDATION_ERROR") {
				handleValidationError(response);
				return;
			}

			// Handle feature not enabled error
			if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
				showErrorToast("Feature not enabled!");
				return;
			}

			// Handle successful response
			if (response.status === "OK") {
				if (response.createdNewRecipeUser === false) {
					showErrorToast(getExistingUserErrorMessage());
				} else {
					showSuccessToast("User created successfully!");
					loadCount();
					resetForm();
					window.location.href = getApiUrl(`?userid=${response.user.id}`);
				}
			}
		} catch (_) {
			showErrorToast("Something went wrong, please try again!");
		} finally {
			setIsCreatingUser(false);
		}
	}

	function checkUndefined(value: string | undefined) {
		return value !== undefined ? value : "";
	}

	useEffect(() => {
		setFormErrorMessage(undefined);
	}, [email, phoneNumber, emailOrPhone]);

	return (
		<Modal
			title="Create User"
			handleClose={onCloseDialog}
			open={true}>
			<Paper withBackground>
				<Form>
					{(() => {
						switch (authMethod) {
							case "EMAIL":
								return (
									<Form.Item>
										<Label
											title="Email"
											htmlFor="email"
										/>
										<TextField
											error={formErrorMessage}
											value={email}
											onChange={(e) => setEmail(e.currentTarget.value)}
											name="email"
										/>
									</Form.Item>
								);
							case "PHONE":
								return (
									<Form.Item>
										<PhoneNumberInput
											error={formErrorMessage}
											name="phone"
											onChange={(value: string | undefined) => {
												setPhoneNumber(checkUndefined(value));
											}}
											label="Phone Number"
											forceShowError
										/>
									</Form.Item>
								);
							case "EMAIL_OR_PHONE":
								return (
									<Form.Item>
										{isPhoneNumber ? (
											<PhoneNumberInput
												error={formErrorMessage}
												value={emailOrPhone}
												name="phone"
												onChange={(value: string | undefined) => {
													setEmailOrPhone(checkUndefined(value));
												}}
												label="Phone Number"
												forceShowError
											/>
										) : (
											<Form.Item>
												<Label
													title="Email or Phone"
													htmlFor="email-or-phone"
												/>
												<TextField
													error={formErrorMessage}
													value={emailOrPhone}
													onChange={(e) => setEmailOrPhone(e.currentTarget.value)}
													name="email-or-phone"
												/>
											</Form.Item>
										)}
									</Form.Item>
								);
							case undefined:
								return null;
							default:
								assertNever(authMethod);
						}
					})()}
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
					disabled={isCreatingUser}>
					Create
				</Button>
			</Flex>
		</Modal>
	);
}
