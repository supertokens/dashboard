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

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import Button from "@shared/components/button";

import "./DeletePermissionModal.module.scss";

interface DeletePermissionModalProps {
	open: boolean;
	handleClose: () => void;
	roleId: string;
	selectedPermissions: string[];
	onDeletePermissions: () => Promise<void>;
	isDeleting: boolean;
}

export default function DeletePermissionModal({
	open,
	handleClose,
	roleId,
	selectedPermissions,
	onDeletePermissions,
	isDeleting,
}: DeletePermissionModalProps) {
	return (
		<Modal
			title="Delete Permission"
			open={open}
			handleClose={handleClose}>
			<Form className="delete-permission-modal">
				<Form.Paper>
					<Text
						size="2"
						className="delete-permission-modal__disclaimer">
						Are you sure you want to delete{" "}
						{selectedPermissions.length === 1
							? "this permission"
							: `these ${selectedPermissions.length} permissions`}
						? This action is irreversible.
					</Text>
				</Form.Paper>
				<Flex
					justify="end"
					mt="4"
					gap="3">
					<Button
						size="3"
						variant="outline"
						color="gray"
						onClick={handleClose}
						disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						color="red"
						size="3"
						onClick={onDeletePermissions}
						disabled={isDeleting}>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
