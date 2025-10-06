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

import { Modal } from "@shared/components/modal";
import { AssignPermission } from "@shared/components/assignPermission";
import Button from "@shared/components/button";
import Form from "@shared/components/form";

import { useRolesList } from "../hooks";

interface AddPermissionModalProps {
	open: boolean;
	handleClose: () => void;
	roleId: string;
	existingPermissions: string[];
	onAddPermissions: (permissions: string[]) => Promise<void>;
	isAdding: boolean;
}

export default function AddPermissionModal({
	open,
	handleClose,
	roleId,
	existingPermissions,
	onAddPermissions,
	isAdding,
}: AddPermissionModalProps) {
	const { allRoles } = useRolesList();
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

	// Get all permissions from all roles (for "existing permissions" section)
	const allExistingPermissions = Array.from(new Set(allRoles.flatMap((role) => role.permissions || []))).sort();

	const handleDone = async () => {
		// Filter out permissions that are already assigned to this role
		const newPermissions = selectedPermissions.filter((p) => !existingPermissions.includes(p));

		if (newPermissions.length > 0) {
			await onAddPermissions(newPermissions);
			setSelectedPermissions([]);
		} else {
			handleClose();
		}
	};

	const handleCloseModal = () => {
		if (!isAdding) {
			setSelectedPermissions([]);
			handleClose();
		}
	};

	return (
		<Modal
			title="Add Permission"
			open={open}
			handleClose={handleCloseModal}
			size="lg">
			<Form>
				<AssignPermission
					existingPermissions={allExistingPermissions}
					selectedPermissions={selectedPermissions}
					onPermissionsChange={setSelectedPermissions}
					disabled={isAdding}
				/>
				<Flex
					justify="end"
					mt="4">
					<Button
						size="3"
						onClick={handleDone}
						disabled={isAdding || selectedPermissions.length === 0}>
						{isAdding ? "Adding..." : "Done"}
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
