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

import Form from "@shared/components/form";

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
			title="Delete Role"
			open={open}
			handleClose={handleClose}>
			<Form className="delete-role-modal">
				<Form.Paper>
					<Text
						size="2"
						className={styles["delete-role-modal__disclaimer"]}>
						Are you sure you want to remove the role <span>"{role}"</span> from this user? This action
						cannot be undone.
					</Text>
				</Form.Paper>
				<Flex
					justify="end"
					mt="4">
					<Button
						color="red"
						size="3"
						onClick={handleRemove}
						loading={isRemoving || isRemovingRole}>
						Delete
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
