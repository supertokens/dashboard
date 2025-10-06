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
import { Flex, TextField } from "@radix-ui/themes";

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import ItemLabel from "@shared/components/itemLabel";
import Button from "@shared/components/button";
import { AssignPermission } from "@shared/components/assignPermission";

import { useRolesList } from "../hooks";

interface CreateNewRoleModalProps {
	handleClose: () => void;
	open: boolean;
	onCreateRole: (roleName: string, permissions: string[]) => Promise<void>;
}

export default function CreateNewRoleModal({ handleClose, open, onCreateRole }: CreateNewRoleModalProps) {
	const { allRoles } = useRolesList();
	const [roleName, setRoleName] = useState("");
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Get all existing permissions from all roles
	const existingPermissions = Array.from(new Set(allRoles.flatMap((role) => role.permissions || []))).sort();

	const handleSave = async () => {
		if (!roleName.trim()) return;

		setIsLoading(true);
		try {
			await onCreateRole(roleName.trim(), selectedPermissions);
			setRoleName("");
			setSelectedPermissions([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCloseModal = () => {
		if (!isLoading) {
			setRoleName("");
			setSelectedPermissions([]);
			handleClose();
		}
	};

	return (
		<Modal
			open={open}
			handleClose={handleCloseModal}
			title="Add New Role"
			size="lg">
			<Form className="create-new-role-modal">
				<Form.Paper>
					<Form.Item>
						<ItemLabel mb="2">Role Name</ItemLabel>
						<TextField.Root
							value={roleName}
							onChange={(e) => setRoleName(e.target.value)}
							disabled={isLoading}
							placeholder="Enter role name"
						/>
					</Form.Item>
				</Form.Paper>
				<AssignPermission
					existingPermissions={existingPermissions}
					selectedPermissions={selectedPermissions}
					onPermissionsChange={setSelectedPermissions}
					disabled={isLoading}
				/>
				<Flex
					justify="end"
					mt="4">
					<Button
						size="3"
						onClick={handleSave}
						disabled={!roleName.trim() || isLoading}>
						{isLoading ? "Creating..." : "Save"}
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
