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
import { Flex, Text } from "@radix-ui/themes";

import Button from "@shared/components/button";
import Form from "@shared/components/form";
import { Modal } from "@shared/components/modal";
import TextField from "@shared/components/text";
import { useToast } from "@shared/components/toast";

import { useLoginMethods } from "@features/users/hooks/useLoginMethods";
import { LoginMethod } from "@features/users/types";

import styles from "./UnlinkLoginMethodModal.module.scss";

interface UnlinkLoginMethodModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly loginMethod: LoginMethod;
	readonly userId: string;
}

export default function UnlinkLoginMethodModal({
	open,
	handleClose,
	loginMethod,
	userId,
}: UnlinkLoginMethodModalProps) {
	const { unlinkLoginMethod, isUnlinkingLoginMethod } = useLoginMethods(userId);
	const { showSuccessToast, showErrorToast } = useToast();

	const [confirmationInput, setConfirmationInput] = useState("");

	useEffect(() => {
		if (open) {
			setConfirmationInput("");
		}
	}, [open]);

	const handleUnlink = async () => {
		try {
			const response = await unlinkLoginMethod(loginMethod.recipeUserId);

			if (response?.status === "OK") {
				showSuccessToast("Login method unlinked successfully");
				handleClose();
			} else {
				showErrorToast("Failed to unlink login method");
			}
		} catch (error) {
			showErrorToast("Failed to unlink login method");
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
			title="Unlink Login Method"
			size="md">
			<Form className={styles["unlink-login-method-modal"]}>
				<Form.Paper>
					<Text
						size="2"
						className={styles["unlink-login-method-modal__description"]}>
						Are you sure you want to unlink the selected login method <strong>{getRecipeName()}</strong>?
					</Text>
					<Text
						size="2"
						className={styles["unlink-login-method-modal__description"]}
						mt="2">
						This action will separate this login method from the primary user account, making it an
						independent user account.
					</Text>
					<Text
						size="2"
						className={styles["unlink-login-method-modal__description"]}
						mt="3">
						To unlink the user, please confirm by typing the user's{" "}
						<strong className={styles["unlink-login-method-modal__identifier"]}>
							{getIdentifierLabel()}
						</strong>
						:{" "}
						<strong className={styles["unlink-login-method-modal__identifier"]}>
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
						onClick={handleUnlink}
						loading={isUnlinkingLoginMethod}
						disabled={confirmationInput !== confirmationIdentifier}>
						Unlink
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
