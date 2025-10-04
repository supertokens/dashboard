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
import Select from "@shared/components/select";
import { useToast } from "@shared/components/toast";
import { useRolesService } from "@api/userroles/role";

import { useUserDetails } from "@features/users/hooks/useUserDetails";

import styles from "./AssignRoleModal.module.scss";

interface AssignRoleModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly userId: string;
	readonly selectedTenantId: string;
}

export default function AssignRoleModal({ open, handleClose, userId, selectedTenantId }: AssignRoleModalProps) {
	const { addRole, isAddingRole } = useUserDetails({ userId, selectedTenantId });
	const { showSuccessToast, showErrorToast } = useToast();
	const { getRoles } = useRolesService();

	const [selectedRole, setSelectedRole] = useState("");
	const [availableRoles, setAvailableRoles] = useState<string[]>([]);

	useEffect(() => {
		const fetchAvailableRoles = async () => {
			try {
				const response = await getRoles();
				if (response?.status === "OK") {
					setAvailableRoles(response.roles);
				}
			} catch (error) {
				showErrorToast("Failed to fetch available roles");
			}
		};

		if (open) {
			void fetchAvailableRoles();
		}
	}, [open, getRoles, showErrorToast]);

	const handleAssign = async () => {
		if (!selectedRole || !selectedTenantId) return;

		try {
			const response = await addRole({
				userId,
				role: selectedRole,
				tenantId: selectedTenantId,
			});

			if (response?.status === "OK") {
				showSuccessToast("Role assigned successfully");
				setSelectedRole("");
				handleClose();
			} else if (response?.status === "UNKNOWN_ROLE_ERROR") {
				showErrorToast("Unknown role selected");
			} else {
				showErrorToast("Failed to assign role");
			}
		} catch (error) {
			showErrorToast("Failed to assign role");
		}
	};

	const roleItems = availableRoles.map((role) => ({ label: role, value: role }));

	return (
		<Modal
			open={open}
			handleClose={handleClose}
			title="Assign Role"
			size="sm">
			<Form className={styles["assign-role-modal"]}>
				<Form.Paper>
					<Form.Item>
						<ItemLabel>Select Role:</ItemLabel>
						<Select
							items={roleItems}
							selectedValue={selectedRole}
							onValueChange={setSelectedRole}
						/>
					</Form.Item>
				</Form.Paper>

				<Flex
					justify="end"
					gap="3"
					mt="5">
					<Button
						size="3"
						variant="outline"
						color="gray"
						onClick={handleClose}
						disabled={isAddingRole}>
						Cancel
					</Button>
					<Button
						size="3"
						onClick={handleAssign}
						loading={isAddingRole}
						disabled={!selectedRole}>
						Assign Role
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
