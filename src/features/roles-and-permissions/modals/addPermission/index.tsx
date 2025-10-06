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
	const [permissionInput, setPermissionInput] = useState("");
	const [newPermissions, setNewPermissions] = useState<string[]>([]);

	const handleAddPermission = () => {
		const trimmedPermission = permissionInput.trim();
		if (
			trimmedPermission &&
			!newPermissions.includes(trimmedPermission) &&
			!existingPermissions.includes(trimmedPermission)
		) {
			setNewPermissions([...newPermissions, trimmedPermission]);
			setPermissionInput("");
		}
	};

	const handleRemovePermission = (permission: string) => {
		setNewPermissions(newPermissions.filter((p) => p !== permission));
	};

	const handleDone = async () => {
		if (newPermissions.length > 0) {
			await onAddPermissions(newPermissions);
			setNewPermissions([]);
			setPermissionInput("");
		} else {
			handleClose();
		}
	};

	const handleCloseModal = () => {
		if (!isAdding) {
			setNewPermissions([]);
			setPermissionInput("");
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
				<Form.Paper>
					<Form.Item>
						<ItemLabel mb="2">Add New Permissions</ItemLabel>
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
								disabled={isAdding}
								placeholder="Enter permission and press Enter"
								style={{ flex: 1 }}
							/>
							<Button
								size="2"
								onClick={handleAddPermission}
								disabled={!permissionInput.trim() || isAdding}>
								Add
							</Button>
						</Flex>
						{newPermissions.length > 0 && (
							<Flex
								gap="2"
								mt="3"
								wrap="wrap">
								{newPermissions.map((permission) => (
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
											disabled={isAdding}>
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
						disabled={isAdding}>
						Cancel
					</Button>
					<Button
						size="3"
						onClick={handleDone}
						disabled={newPermissions.length === 0 || isAdding}>
						{isAdding ? "Adding..." : "Done"}
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
