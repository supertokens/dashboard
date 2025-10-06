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

interface CreateNewRoleModalProps {
	handleClose: () => void;
	open: boolean;
	onCreateRole: (roleName: string, permissions: string[]) => Promise<void>;
}

export default function CreateNewRoleModal({ handleClose, open, onCreateRole }: CreateNewRoleModalProps) {
	const [roleName, setRoleName] = useState("");
	const [permissionInput, setPermissionInput] = useState("");
	const [permissions, setPermissions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleAddPermission = () => {
		const trimmedPermission = permissionInput.trim();
		if (trimmedPermission && !permissions.includes(trimmedPermission)) {
			setPermissions([...permissions, trimmedPermission]);
			setPermissionInput("");
		}
	};

	const handleRemovePermission = (permission: string) => {
		setPermissions(permissions.filter((p) => p !== permission));
	};

	const handleSave = async () => {
		if (!roleName.trim()) return;

		setIsLoading(true);
		try {
			await onCreateRole(roleName.trim(), permissions);
			setRoleName("");
			setPermissions([]);
			setPermissionInput("");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCloseModal = () => {
		if (!isLoading) {
			setRoleName("");
			setPermissions([]);
			setPermissionInput("");
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
				<Form.Paper>
					<Form.Item>
						<ItemLabel mb="2">Permissions (Optional)</ItemLabel>
						<Flex
							gap="2"
							align="center">
							<TextField.Root
								value={permissionInput}
								onChange={(e) => setPermissionInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddPermission();
									}
								}}
								disabled={isLoading}
								placeholder="Enter permission and press Enter"
								style={{ flex: 1 }}
							/>
							<Button
								size="2"
								onClick={handleAddPermission}
								disabled={!permissionInput.trim() || isLoading}>
								Add
							</Button>
						</Flex>
						{permissions.length > 0 && (
							<Flex
								gap="2"
								mt="3"
								wrap="wrap">
								{permissions.map((permission) => (
									<Flex
										key={permission}
										align="center"
										gap="2"
										style={{
											padding: "4px 8px",
											background: "var(--accent-3)",
											borderRadius: "4px",
										}}>
										{permission}
										<button
											onClick={() => handleRemovePermission(permission)}
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												padding: 0,
											}}
											disabled={isLoading}>
											×
										</button>
									</Flex>
								))}
							</Flex>
						)}
					</Form.Item>
				</Form.Paper>
				<Flex
					justify="end"
					mt="4"
					gap="3">
					<Button
						size="3"
						variant="outline"
						color="gray"
						onClick={handleCloseModal}
						disabled={isLoading}>
						Cancel
					</Button>
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
