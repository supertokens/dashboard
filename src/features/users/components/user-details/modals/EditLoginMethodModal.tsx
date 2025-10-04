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

import { useState, useEffect } from "react";
import { Flex } from "@radix-ui/themes";

import Button from "@shared/components/button";
import Form from "@shared/components/form";
import ItemLabel from "@shared/components/itemLabel";
import { Modal } from "@shared/components/modal";
import TextField from "@shared/components/text";
import PhoneNumberInput from "@shared/components/phoneNumberInput";
import { useToast } from "@shared/components/toast";

import { useLoginMethods } from "@features/users/hooks/useLoginMethods";
import { LoginMethod } from "@features/users/types";

import styles from "./EditLoginMethodModal.module.scss";

interface EditLoginMethodModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly loginMethod: LoginMethod;
	readonly userId: string;
}

export default function EditLoginMethodModal({ open, handleClose, loginMethod, userId }: EditLoginMethodModalProps) {
	const { updateLoginMethod, isUpdatingLoginMethod } = useLoginMethods(userId);
	const { showSuccessToast, showErrorToast } = useToast();

	const [editedEmail, setEditedEmail] = useState(loginMethod.email || "");
	const [editedPhone, setEditedPhone] = useState(loginMethod.phoneNumber || "");
	const [error, setError] = useState("");

	useEffect(() => {
		if (open) {
			setEditedEmail(loginMethod.email || "");
			setEditedPhone(loginMethod.phoneNumber || "");
			setError("");
		}
	}, [open, loginMethod]);

	const handleSave = async () => {
		setError("");

		try {
			const response = await updateLoginMethod({
				userId,
				recipeId: loginMethod.recipeId,
				recipeUserId: loginMethod.recipeUserId,
				tenantId: loginMethod.tenantIds[0],
				email: editedEmail,
				phone: editedPhone,
				firstName: undefined,
				lastName: undefined,
			});

			if (response.status === "OK") {
				showSuccessToast("Login method updated successfully");
				handleClose();
			} else if (response.status === "INVALID_EMAIL_ERROR") {
				setError(response.error);
			} else if (response.status === "INVALID_PHONE_ERROR") {
				setError(response.error);
			} else if (response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
				setError("Email already exists");
			} else if (response.status === "PHONE_ALREADY_EXISTS_ERROR") {
				setError("Phone number already exists");
			}
		} catch (err) {
			showErrorToast("Failed to update login method");
		}
	};

	const getRecipeName = () => {
		switch (loginMethod.recipeId) {
			case "emailpassword":
				return "Email Password";
			case "passwordless":
				return "Passwordless";
			case "thirdparty":
				return `Third Party - ${loginMethod.thirdParty?.id || ""}`;
			default:
				return "";
		}
	};

	return (
		<Modal
			title={`Edit ${getRecipeName()} Login Method`}
			open={open}
			handleClose={handleClose}
			size="sm">
			<Form className={styles["edit-login-method-modal"]}>
				<Form.Paper>
					{loginMethod.email && loginMethod.recipeId !== "thirdparty" && (
						<Form.Item mb="3">
							<ItemLabel required>Email:</ItemLabel>
							<TextField
								type="email"
								value={editedEmail}
								onChange={(e) => setEditedEmail(e.target.value)}
								error={error || undefined}
								disabled={isUpdatingLoginMethod}
							/>
						</Form.Item>
					)}

					{loginMethod.recipeId === "passwordless" && (
						<Form.Item>
							<ItemLabel>Phone Number:</ItemLabel>
							<PhoneNumberInput
								value={editedPhone}
								onChange={setEditedPhone}
								disabled={isUpdatingLoginMethod}
								className={styles["edit-login-method-modal__phone-input"]}
							/>
						</Form.Item>
					)}

					{error && (
						<Form.Item mt="2">
							<div className={styles["edit-login-method-modal__error"]}>{error}</div>
						</Form.Item>
					)}
				</Form.Paper>
				<Flex
					justify="end"
					mt="4"
					gap="3">
					<Button
						size="3"
						variant="outline"
						color="gray"
						onClick={handleClose}
						disabled={isUpdatingLoginMethod}>
						Cancel
					</Button>
					<Button
						size="3"
						onClick={handleSave}
						loading={isUpdatingLoginMethod}>
						Save Changes
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
