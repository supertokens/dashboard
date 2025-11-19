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

import { useState } from "react";
import { Flex, Text } from "@radix-ui/themes";

import Button from "@shared/components/button";
import Form from "@shared/components/form";
import { Modal } from "@shared/components/modal";
import { useToast } from "@shared/components/toast";
import { withOverride } from "@plugins";

import { useRoleDetails } from "../hooks";

import "./DeleteRoleModal.module.scss";

interface DeleteRoleModalProps {
	open: boolean;
	handleClose: () => void;
	roleId: string;
	onDeleteSuccess: () => void;
}

const DeleteRoleModal = withOverride(
	"DeleteRoleModal",
	function DeleteRoleModal({ open, handleClose, roleId, onDeleteSuccess }: DeleteRoleModalProps) {
		const { showErrorToast } = useToast();
		const { deleteRole } = useRoleDetails(roleId);
		const [isDeleting, setIsDeleting] = useState(false);

		const handleDelete = async () => {
			setIsDeleting(true);
			try {
				const response = await deleteRole();

				if (!response) {
					throw new Error("Failed to delete role");
				}

				if (response.status === "OK") {
					handleClose();
					onDeleteSuccess();
				} else if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
					showErrorToast("Feature is not enabled");
				} else {
					throw new Error("Failed to delete role");
				}
			} catch {
				showErrorToast("Something went wrong. Please try again!");
			} finally {
				setIsDeleting(false);
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
							className="delete-role-modal__disclaimer">
							Are you certain you want to delete role <span>"{roleId}"</span>? This action is
							irreversible.
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
							onClick={handleDelete}
							disabled={isDeleting}>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</Flex>
				</Form>
			</Modal>
		);
	}
);

export default DeleteRoleModal;
