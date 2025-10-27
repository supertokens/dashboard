/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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
import { withOverride } from "@plugins";

import styles from "./DeletePermissionModal.module.scss";

interface DeletePermissionModalProps {
	open: boolean;
	handleClose: () => void;
	roleId: string;
	selectedPermissions: string[];
	onDeletePermissions: () => Promise<void>;
	isDeleting: boolean;
}

const DeletePermissionModal = withOverride(
	"DeletePermissionModal",
	function DeletePermissionModal({
		open,
		handleClose,
		selectedPermissions,
		onDeletePermissions,
		isDeleting,
	}: DeletePermissionModalProps) {
		return (
			<Modal
				title="Remove Permission"
				open={open}
				handleClose={handleClose}>
				<Form className={styles["delete-permission-modal"]}>
					<Form.Paper>
						<Text
							size="2"
							className={styles["delete-permission-modal__disclaimer"]}>
							Are you sure you want to remove{" "}
							{selectedPermissions.length === 1
								? "this permission from this role"
								: `these ${selectedPermissions.length} permissions from this role`}
							?
						</Text>
					</Form.Paper>
					<Flex
						justify="end"
						mt="5">
						<Button
							color="red"
							size="3"
							onClick={onDeletePermissions}
							disabled={isDeleting}>
							{isDeleting ? "Removing..." : "Remove"}
						</Button>
					</Flex>
				</Form>
			</Modal>
		);
	}
);

export default DeletePermissionModal;
