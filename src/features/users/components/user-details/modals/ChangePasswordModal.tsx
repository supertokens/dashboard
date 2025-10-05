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
import ItemLabel from "@shared/components/itemLabel";
import { Modal } from "@shared/components/modal";
import TextField from "@shared/components/text";
import { useToast } from "@shared/components/toast";

import { useLoginMethods } from "@features/users/hooks/useLoginMethods";
import { useTenants } from "@features/tenants/hooks/useTenants";
import { FactorIds } from "@shared/constants";

import styles from "./ChangePasswordModal.module.scss";

interface ChangePasswordModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly recipeUserId: string;
	readonly userId: string;
	readonly tenantIds: string[];
}

export default function ChangePasswordModal({
	open,
	handleClose,
	recipeUserId,
	userId,
	tenantIds,
}: ChangePasswordModalProps) {
	const { changePassword, isChangingPassword } = useLoginMethods(userId);
	const { showSuccessToast, showErrorToast } = useToast();
	const { tenants } = useTenants();

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [newPasswordError, setNewPasswordError] = useState("");
	const [confirmPasswordError, setConfirmPasswordError] = useState("");
	const [noValidTenantError, setNoValidTenantError] = useState(false);

	const clearForm = () => {
		setNewPassword("");
		setConfirmPassword("");
		setNewPasswordError("");
		setConfirmPasswordError("");
		setNoValidTenantError(false);
	};

	useEffect(() => {
		if (open) {
			clearForm();
		}
	}, [open]);

	const handleChangePassword = async () => {
		setNewPasswordError("");
		setConfirmPasswordError("");
		setNoValidTenantError(false);

		let hasError = false;

		if (!newPassword) {
			setNewPasswordError("Password is required");
			hasError = true;
		}

		if (!confirmPassword) {
			setConfirmPasswordError("Please confirm your password");
			hasError = true;
		} else if (newPassword && newPassword !== confirmPassword) {
			setConfirmPasswordError("Passwords do not match");
			hasError = true;
		}

		if (hasError) {
			return;
		}

		// Check if user belongs to a tenant with emailpassword enabled
		const userTenants = tenants?.filter((tenant) => tenantIds.includes(tenant.tenantId)) || [];
		const matchingTenants = userTenants.filter((tenant) => tenant.firstFactors.includes(FactorIds.EMAILPASSWORD));

		if (matchingTenants.length === 0) {
			setNoValidTenantError(true);
			return;
		}

		const tenantIdToUse = matchingTenants[0].tenantId;

		try {
			const response = await changePassword({ recipeUserId, newPassword, tenantId: tenantIdToUse });

			if (response.status === "OK") {
				showSuccessToast("Password updated successfully");
				handleClose();
			} else if (response.status === "INVALID_PASSWORD_ERROR") {
				setNewPasswordError(response.error);
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
					{noValidTenantError && (
						<Form.Item mb="3">
							<Text
								size="2"
								className={styles["change-password-modal__error"]}>
								User does not belong to a tenant that has the emailpassword recipe enabled.
							</Text>
						</Form.Item>
					)}
					<Form.Item mb="3">
						<ItemLabel
							mb="1"
							required>
							New Password:
						</ItemLabel>
						<TextField
							type="password"
							value={newPassword}
							onChange={(e) => {
								setNewPassword(e.target.value);
								setNewPasswordError("");
							}}
							error={newPasswordError || undefined}
						/>
					</Form.Item>
					<Form.Item>
						<ItemLabel
							mb="1"
							required>
							Confirm New Password:
						</ItemLabel>
						<TextField
							type="password"
							value={confirmPassword}
							onChange={(e) => {
								setConfirmPassword(e.target.value);
								setConfirmPasswordError("");
							}}
							error={confirmPasswordError || undefined}
						/>
					</Form.Item>
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
