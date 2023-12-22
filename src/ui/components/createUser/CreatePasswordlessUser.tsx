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

import { isValidPhoneNumber } from "libphonenumber-js";
import { useContext, useState } from "react";
import { PasswordlessContactMethod } from "../../../api/tenants/list";
import useCreateUserService, { CreatePasswordlessUserPayload } from "../../../api/user/create";
import { getApiUrl, getImageUrl, isValidEmail } from "../../../utils";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import Button from "../button";
import { Dialog, DialogContent, DialogFooter } from "../dialog";
import InputField from "../inputField/InputField";
import { PhoneNumberInput } from "../phoneNumber/PhoneNumberInput";
import { CreateUserDialogStepType } from "./CreateUserDialog";

type CreatePasswordlessUserProps = {
	tenantId: string;
	authMethod: PasswordlessContactMethod;
	onCloseDialog: () => void;
	setCurrentStep: (step: CreateUserDialogStepType) => void;
};

function validatePhoneNumber(value: string): boolean {
	const trimmedString = value.replaceAll(/\s/g, "").trim();

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
}: CreatePasswordlessUserProps) {
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [emailOrPhone, setEmailOrPhone] = useState("");

	const [generalErrorMessage, setGeneralErrorMessage] = useState<string | undefined>(undefined);

	const [isCreatingUser, setIsCreatingUser] = useState(false);
	const [isPhoneNumber, setIsPhoneNumber] = useState(false);

	const { createPasswordlessUser } = useCreateUserService();
	const { showToast } = useContext(PopupContentContext);

	async function createUser(e: React.FormEvent<HTMLFormElement | HTMLButtonElement>) {
		e.preventDefault();

		setIsCreatingUser(true);
		setGeneralErrorMessage(undefined);
		try {
			const payload: CreatePasswordlessUserPayload = {};

			if (authMethod === "EMAIL") {
				if (isValidEmail(email) === true) {
					payload.email = email;
				} else {
					setGeneralErrorMessage("Please enter a valid email address.");
					return;
				}
			} else if (authMethod === "PHONE") {
				if (isValidPhoneNumber(phoneNumber) === true) {
					payload.phoneNumber = phoneNumber;
				} else {
					setGeneralErrorMessage("Please enter a valid phone number.");
					return;
				}
			} else if (authMethod === "EMAIL_OR_PHONE") {
				if (isValidEmail(emailOrPhone) === true) {
					payload.email = emailOrPhone;
				} else if (isValidPhoneNumber(emailOrPhone) === true) {
					setIsPhoneNumber(true);
					payload.phoneNumber = emailOrPhone;
				} else if (validatePhoneNumber(emailOrPhone)) {
					setGeneralErrorMessage("Please enter a valid phone number");
					setIsPhoneNumber(true);
					return;
				} else {
					setGeneralErrorMessage("Please enter a valid email or phone number.");
					return;
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

			if (response.status === "INPUT_VALIDATION_ERROR") {
				setGeneralErrorMessage(response.message);
				return;
			}

			if (response.status === "OK") {
				if (response.createdNewRecipeUser === false) {
					let message = "";
					if (authMethod === "EMAIL") {
						message = "User with this email already exists!";
					} else if (authMethod === "PHONE") {
						message = "User with this phone number already exists!";
					} else {
						message = "User with these credentials already exists!";
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

	return (
		<Dialog
			className="max-width-410"
			title="User Info"
			onCloseDialog={onCloseDialog}>
			<DialogContent className="text-small text-semi-bold">
				<form
					className="dialog-form-content-container"
					onSubmit={createUser}>
					{authMethod === "EMAIL" && (
						<InputField
							error={generalErrorMessage}
							label="Email"
							hideColon
							value={email}
							handleChange={(e) => {
								setGeneralErrorMessage(undefined);
								setEmail(e.currentTarget.value);
							}}
							name="email"
							type="email"
						/>
					)}
					{authMethod === "PHONE" && (
						<PhoneNumberInput
							error={generalErrorMessage}
							name="phone"
							onChange={(phNumber) => {
								setGeneralErrorMessage(undefined);
								setPhoneNumber(phNumber);
							}}
							label="Phone Number"
							hideColon
						/>
					)}
					{authMethod === "EMAIL_OR_PHONE" && (
						<>
							{isPhoneNumber ? (
								<PhoneNumberInput
									error={generalErrorMessage}
									value={emailOrPhone}
									name="phone"
									onChange={(phNumber) => {
										setGeneralErrorMessage(undefined);
										setEmailOrPhone(phNumber);
									}}
									label="Phone Number"
									forceShowError
									hideColon
								/>
							) : (
								<InputField
									error={generalErrorMessage}
									label="Email or Phone"
									hideColon
									value={emailOrPhone}
									handleChange={(e) => {
										setGeneralErrorMessage(undefined);
										setEmailOrPhone(e.currentTarget.value);
									}}
									name="emailOrPhone"
									type="text"
								/>
							)}
						</>
					)}
				</form>
				<DialogFooter border="border-top">
					<Button
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
			</DialogContent>
		</Dialog>
	);
}
