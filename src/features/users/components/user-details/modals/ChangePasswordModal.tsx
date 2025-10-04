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

import { useState } from "react";
import { Flex } from "@radix-ui/themes";

import Button from "@shared/components/button";
import Form from "@shared/components/form";
import ItemLabel from "@shared/components/itemLabel";
import { Modal } from "@shared/components/modal";
import TextField from "@shared/components/text";
import { useToast } from "@shared/components/toast";

import { useLoginMethods } from "@features/users/hooks/useLoginMethods";

import styles from "./ChangePasswordModal.module.scss";

interface ChangePasswordModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly recipeUserId: string;
	readonly userId: string;
	readonly tenantId?: string;
}

export default function ChangePasswordModal({
	open,
	handleClose,
	recipeUserId,
	userId,
	tenantId,
}: ChangePasswordModalProps) {
	const { changePassword, isChangingPassword } = useLoginMethods(userId);
	const { showSuccessToast, showErrorToast } = useToast();

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");

	const handleChangePassword = async () => {
		setError("");

		if (!newPassword || !confirmPassword) {
			setError("Please fill in all fields");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		try {
			const response = await changePassword({ recipeUserId, newPassword, tenantId });

			if (response.status === "OK") {
				showSuccessToast("Password updated successfully");
				handleClose();
				setNewPassword("");
				setConfirmPassword("");
			} else if (response.status === "INVALID_PASSWORD_ERROR") {
				setError(response.error);
			}
		} catch (err) {
			showErrorToast("Failed to update password");
		}
	};

	return (
		<Modal
			title="Change Password"
			open={open}
			handleClose={handleClose}
			size="sm">
			<Form className={styles["change-password-modal"]}>
				<Form.Paper>
					<Form.Item mb="2">
						<ItemLabel required>New Password:</ItemLabel>
						<TextField
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							error={error && !newPassword ? error : undefined}
						/>
					</Form.Item>
					<Form.Item>
						<ItemLabel required>Confirm New Password:</ItemLabel>
						<TextField
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							error={error && !confirmPassword ? error : undefined}
						/>
					</Form.Item>
					{error && (
						<Form.Item mt="2">
							<div className={styles["change-password-modal__error"]}>{error}</div>
						</Form.Item>
					)}
				</Form.Paper>
				<Flex
					justify="end"
					mt="4">
					<Button
						size="3"
						onClick={handleChangePassword}
						loading={isChangingPassword}>
						Update Password
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
