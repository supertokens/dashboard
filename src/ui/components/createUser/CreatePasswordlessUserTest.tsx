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
import { PasswordlessContactMethod } from "@api/tenants/types";
import useCreateUserService, { CreatePasswordlessUserPayload } from "@api/user/create";
import { getApiUrl, getImageUrl } from "@utils";
import { PopupContentContext } from "@contexts/PopupContentContext";
import { CreateUserDialogStepType } from "./CreateUserDialog";
import { Modal } from "@components/radix/modal";
import Form from "@components/radix/form";
import { assertNever } from "@utils/assertNever";
import Label from "@components/radix/label";
import TextField from "@components/radix/text";
import { Flex } from "@radix-ui/themes";
import Button from "@components/radix/button";
import PhoneNumberInput from "@components/radix/phoneNumberInput";
import Paper from "@components/radix/paper";

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
	const { showToast } = useContext(PopupContentContext);

	async function createUser(e: React.FormEvent<HTMLFormElement | HTMLButtonElement>) {
		e.preventDefault();

		setIsCreatingUser(true);
		setFormErrorMessage(undefined);
		try {
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
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>No matching auth method found!</>,
				});
				return;
			}
			const response = await createPasswordlessUser(tenantId, payload);

			if (response.status === "EMAIL_VALIDATION_ERROR" || response.status === "PHONE_VALIDATION_ERROR") {
				if (
					authMethod === "EMAIL_OR_PHONE" &&
					response.status === "EMAIL_VALIDATION_ERROR" &&
					isNumber(emailOrPhone) === false
				) {
					setFormErrorMessage("Please enter a valid email or phone number.");
					return;
				}
				setFormErrorMessage(response.message);
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
				if (response.createdNewRecipeUser === false) {
					let message = "";
					if (authMethod === "EMAIL") {
						message = "User with this email already exists!";
					} else if (authMethod === "PHONE") {
						message = "User with this phone number already exists!";
					} else {
						message =
							isNumber(emailOrPhone) === false
								? "User with this email already exists!"
								: "User with this phone number already exists!";
					}
					showToast({
						iconImage: getImageUrl("form-field-error-icon.svg"),
						toastType: "error",
						children: <>{message}</>,
					});
				} else {
					showToast({
						iconImage: getImageUrl("checkmark-green.svg"),
						toastType: "success",
						children: <>User created successfully!</>,
					});
					loadCount();
					setEmail("");
					setPhoneNumber("");
					setEmailOrPhone("");
					window.open(getApiUrl(`?userid=${response.user.id}`), "_blank");
				}
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
					isLoading={isCreatingUser}
					disabled={isCreatingUser}>
					Create
				</Button>
			</Flex>
		</Modal>
	);
}
