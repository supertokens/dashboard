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
import { Flex, Text } from "@radix-ui/themes";

import Button from "@shared/components/button";
import Form from "@shared/components/form";
import { Modal } from "@shared/components/modal";
import TextField from "@shared/components/text";
import { useToast } from "@shared/components/toast";

import useDeleteUserService from "@api/user/delete";
import { useNavigationHelpers } from "@shared/navigation";

import { useUser } from "@features/users/hooks/useUser";

import styles from "./DeleteUserModal.module.scss";

interface DeleteUserModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly userId: string;
}

export default function DeleteUserModal({ open, handleClose, userId }: DeleteUserModalProps) {
	const { userDetails } = useUser(userId);
	const { showSuccessToast, showErrorToast } = useToast();
	const { deleteUser } = useDeleteUserService();
	const { goToUsersList } = useNavigationHelpers();

	const [isDeleting, setIsDeleting] = useState(false);
	const [userDisplayNameInput, setFormUserDisplayNameInput] = useState("");

	useEffect(() => {
		if (open) {
			setFormUserDisplayNameInput("");
		}
	}, [open]);

	const handleDelete = async () => {
		if (userDetails?.status !== "OK") return;
		try {
			setIsDeleting(true);
			const result = await deleteUser(userDetails.user.id, true);

			if (result && result.status === "OK") {
				showSuccessToast("User deleted successfully");
				goToUsersList();
			} else {
				showErrorToast("Failed to delete user");
			}
		} catch (error) {
			showErrorToast("Failed to delete user");
		} finally {
			setIsDeleting(false);
			handleClose();
		}
	};

	if (userDetails?.status !== "OK") {
		return null;
	}

	const userDisplayName =
		userDetails.user.firstName && userDetails.user.lastName
			? `${userDetails.user.firstName} ${userDetails.user.lastName}`
			: userDetails.user.emails[0] || userDetails.user.phoneNumbers[0] || "this user";

	return (
		<Modal
			title="Delete User"
			open={open}
			handleClose={handleClose}
			size="md">
			<Form className={styles["delete-user-modal"]}>
				<Form.Paper>
					<Text
						size="2"
						className={styles["delete-user-modal__disclaimer"]}>
						You are about to delete <strong>{userDisplayName}</strong>.
					</Text>
					<Text
						size="2"
						className={styles["delete-user-modal__disclaimer"]}
						mt="2">
						This will permanently delete this user and all accounts linked to them. This action{" "}
						<strong>cannot be undone</strong>.
					</Text>
					<Text
						size="2"
						className={styles["delete-user-modal__disclaimer"]}
						mt="3">
						To confirm, type{" "}
						<strong className={styles["delete-user-modal__identifier"]}>{userDisplayName}</strong> below:
					</Text>
					<Form.Item mt="3">
						<TextField
							placeholder={`Type "${userDisplayName}" to confirm`}
							value={userDisplayNameInput}
							onChange={(e) => setFormUserDisplayNameInput(e.target.value)}
						/>
					</Form.Item>
				</Form.Paper>
				<Flex
					justify="end"
					mt="4">
					<Button
						color="red"
						size="3"
						onClick={handleDelete}
						loading={isDeleting}
						disabled={userDisplayNameInput !== userDisplayName}>
						Delete
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
