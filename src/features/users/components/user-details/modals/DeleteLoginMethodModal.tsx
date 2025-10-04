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

import { Flex, Text } from "@radix-ui/themes";

import Button from "@shared/components/button";
import { Modal } from "@shared/components/modal";
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
				return `Third Party - ${loginMethod.thirdParty?.id || ""}`;
			default:
				return "";
		}
	};

	return (
		<Modal
			open={open}
			handleClose={handleClose}
			title="Delete Login Method"
			size="sm">
			<div className={styles["delete-login-method-modal"]}>
				<Text className={styles["delete-login-method-modal__description"]}>
					Are you sure you want to delete the <strong>{getRecipeName()}</strong> login method?
					{isOnlyLoginMethod && (
						<>
							<br />
							<br />
							<strong>Warning:</strong> This is the only login method for this user. Deleting it will
							remove the user entirely.
						</>
					)}
				</Text>

				<Flex
					justify="end"
					gap="3"
					mt="5">
					<Button
						size="3"
						variant="outline"
						color="gray"
						onClick={handleClose}
						disabled={isDeletingLoginMethod}>
						Cancel
					</Button>
					<Button
						size="3"
						color="red"
						onClick={handleDelete}
						loading={isDeletingLoginMethod}>
						Delete Login Method
					</Button>
				</Flex>
			</div>
		</Modal>
	);
}
