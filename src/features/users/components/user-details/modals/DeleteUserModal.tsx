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
import { useNavigate } from "react-router-dom";
import { Flex, Text } from "@radix-ui/themes";

import Button from "@shared/components/button";
import { Modal } from "@shared/components/modal";
import { useToast } from "@shared/components/toast";
import useDeleteUserService from "@api/user/delete";

import { useUserDetails } from "@features/users/hooks/useUserDetails";

import styles from "./DeleteUserModal.module.scss";

interface DeleteUserModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly userId: string;
}

export default function DeleteUserModal({ open, handleClose, userId }: DeleteUserModalProps) {
	const navigate = useNavigate();
	const { userDetails } = useUserDetails({ userId });
	const { showSuccessToast, showErrorToast } = useToast();
	const { deleteUser } = useDeleteUserService();

	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (userDetails?.status !== "OK") return;

		try {
			setIsDeleting(true);
			const result = await deleteUser(userDetails.user.id, true);

			if (result && result.status === "OK") {
				showSuccessToast("User deleted successfully");
				navigate("/users"); // Navigate back to users list
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
			open={open}
			handleClose={handleClose}
			title="Delete User"
			size="sm">
			<div className={styles["delete-user-modal"]}>
				<Text className={styles["delete-user-modal__description"]}>
					Are you sure you want to delete <strong>{userDisplayName}</strong>? This action cannot be undone.
				</Text>

				<Flex
					justify="end"
					gap="3"
					mt="5">
					<Button
						size="3"
						variant="outline"
						color="gray"
						onClick={handleClose}
						disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						size="3"
						color="red"
						onClick={handleDelete}
						loading={isDeleting}>
						Delete User
					</Button>
				</Flex>
			</div>
		</Modal>
	);
}
