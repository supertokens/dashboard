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

import { useState, useEffect } from "react";
import { Flex, Text } from "@radix-ui/themes";

import Button from "@shared/components/button";
import Form from "@shared/components/form";
import { Modal } from "@shared/components/modal";
import TextField from "@shared/components/text";
import { useToast } from "@shared/components/toast";

import { useLoginMethods } from "@features/users/hooks/useLoginMethods";
import { LoginMethod } from "@features/users/types";

import styles from "./DeleteLoginMethodModal.module.scss";

interface DeleteLoginMethodModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly loginMethod: LoginMethod;
	readonly userId: string;
	readonly isOnlyLoginMethod: boolean;
}

export default function DeleteLoginMethodModal({
	open,
	handleClose,
	loginMethod,
	userId,
	isOnlyLoginMethod,
}: DeleteLoginMethodModalProps) {
	const { deleteLoginMethod, isDeletingLoginMethod } = useLoginMethods(userId);
	const { showSuccessToast, showErrorToast } = useToast();

	const [confirmationInput, setConfirmationInput] = useState("");

	useEffect(() => {
		if (open) {
			setConfirmationInput("");
		}
	}, [open]);

	const handleDelete = async () => {
		try {
			const response = await deleteLoginMethod({
				recipeUserId: loginMethod.recipeUserId,
				removeAllLinkedAccounts: false,
			});

			if (response?.status === "OK") {
				showSuccessToast("Login method deleted successfully");
				handleClose();
			} else {
				showErrorToast("Failed to delete login method");
			}
		} catch (error) {
			showErrorToast("Failed to delete login method");
		}
	};

	const getRecipeName = () => {
		switch (loginMethod.recipeId) {
			case "emailpassword":
				return "Email Password";
			case "passwordless":
				return "Passwordless";
			case "thirdparty":
				return `Third Party  ${loginMethod.thirdParty?.id ? `- ${loginMethod.thirdParty?.id}` : ""}`;
			default:
				return "";
		}
	};

	const getConfirmationIdentifier = () => {
		switch (loginMethod.recipeId) {
			case "emailpassword":
				return loginMethod.email || "";
			case "passwordless":
				return loginMethod.email || loginMethod.phoneNumber || "";
			case "thirdparty":
				return loginMethod.email || loginMethod.thirdParty?.userId || "";
			default:
				return "";
		}
	};

	const getIdentifierLabel = () => {
		switch (loginMethod.recipeId) {
			case "emailpassword":
				return "email";
			case "passwordless":
				return loginMethod.email ? "email" : "phone number";
			case "thirdparty":
				return loginMethod.email ? "email" : "provider ID";
			default:
				return "identifier";
		}
	};

	const confirmationIdentifier = getConfirmationIdentifier();

	return (
		<Modal
			open={open}
			handleClose={handleClose}
			title="Delete Login Method"
			size="md">
			<Form className={styles["delete-login-method-modal"]}>
				<Form.Paper>
					<Text
						size="2"
						className={styles["delete-login-method-modal__description"]}>
						Are you sure you want to delete the selected login method <strong>{getRecipeName()}</strong>?
					</Text>
					{isOnlyLoginMethod && (
						<Text
							size="2"
							className={styles["delete-login-method-modal__description"]}
							mt="2">
							<strong>Warning:</strong> This is the only login method for this user. Deleting it will
							remove the user entirely. This action cannot be undone.
						</Text>
					)}
					<Text
						size="2"
						className={styles["delete-login-method-modal__description"]}
						mt="3">
						To delete the login method, please confirm by typing the user's{" "}
						<strong className={styles["delete-login-method-modal__identifier"]}>
							{getIdentifierLabel()}
						</strong>
						:{" "}
						<strong className={styles["delete-login-method-modal__identifier"]}>
							{confirmationIdentifier}
						</strong>{" "}
						below:
					</Text>
					<Form.Item mt="3">
						<TextField
							placeholder={`Type "${confirmationIdentifier}" to confirm`}
							value={confirmationInput}
							onChange={(e) => setConfirmationInput(e.target.value)}
						/>
					</Form.Item>
				</Form.Paper>

				<Flex
					justify="end"
					mt="4">
					<Button
						size="3"
						color="red"
						onClick={handleDelete}
						loading={isDeletingLoginMethod}
						disabled={confirmationInput !== confirmationIdentifier}>
						Delete
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
