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
import { Flex, Text } from "@radix-ui/themes";

import Button from "@shared/components/button";
import { Modal } from "@shared/components/modal";
import { useToast } from "@shared/components/toast";

import { useRoles } from "@features/users/hooks/useRoles";

import styles from "./RemoveRoleModal.module.scss";

interface RemoveRoleModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly role?: string;
	readonly userIdProp: string;
	readonly selectedTenantId: string;
}

export default function RemoveRoleModal({
	open,
	handleClose,
	role,
	userIdProp,
	selectedTenantId,
}: RemoveRoleModalProps) {
	const { removeRole, isRemovingRole } = useRoles(userIdProp, selectedTenantId);
	const { showSuccessToast, showErrorToast } = useToast();

	const [isRemoving, setIsRemoving] = useState(false);

	const handleRemove = async () => {
		if (!role || !selectedTenantId) return;

		try {
			setIsRemoving(true);
			const response = await removeRole({
				userId: userIdProp,
				role,
				tenantId: selectedTenantId,
			});

			if (response?.status === "OK") {
				showSuccessToast("Role removed successfully");
				handleClose();
			} else {
				showErrorToast("Failed to remove role");
			}
		} catch (error) {
			showErrorToast("Failed to remove role");
		} finally {
			setIsRemoving(false);
		}
	};

	return (
		<Modal
			open={open}
			handleClose={handleClose}
			title="Remove Role"
			size="sm">
			<div className={styles["remove-role-modal"]}>
				<Text className={styles["remove-role-modal__description"]}>
					Are you sure you want to remove the role <strong>{role}</strong> from this user?
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
						disabled={isRemoving || isRemovingRole}>
						Cancel
					</Button>
					<Button
						size="3"
						color="red"
						onClick={handleRemove}
						loading={isRemoving || isRemovingRole}>
						Remove Role
					</Button>
				</Flex>
			</div>
		</Modal>
	);
}
