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
				return `Third Party - ${loginMethod.thirdParty?.id || ""}`;
			default:
				return "";
		}
	};

	return (
		<Modal
			open={open}
			handleClose={handleClose}
			title="Unlink Login Method"
			size="sm">
			<div className={styles["unlink-login-method-modal"]}>
				<Text className={styles["unlink-login-method-modal__description"]}>
					Are you sure you want to unlink the <strong>{getRecipeName()}</strong> login method? This action
					will separate this login method from the primary user account, making it an independent user
					account.
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
						disabled={isUnlinkingLoginMethod}>
						Cancel
					</Button>
					<Button
						size="3"
						color="orange"
						onClick={handleUnlink}
						loading={isUnlinkingLoginMethod}>
						Unlink Login Method
					</Button>
				</Flex>
			</div>
		</Modal>
	);
}
