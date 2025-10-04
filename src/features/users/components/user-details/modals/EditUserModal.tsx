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
import { Box, Flex, Text, Tooltip } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";
import Crystal from "@shared/components/crystal";
import Form from "@shared/components/form";
import ItemLabel from "@shared/components/itemLabel";
import { Modal } from "@shared/components/modal";
import TextField from "@shared/components/text";
import { useToast } from "@shared/components/toast";

import { useUserDetails } from "@features/users/hooks/useUserDetails";
import { User } from "@features/users/types";

import styles from "./EditUserModal.module.scss";

interface EditUserModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly userId: string;
}

const TooltipContent = () => {
	return (
		<Box p="2">
			<Text className={styles["edit-user-modal__tooltip-text"]}>
				Primary users are users that can be linked to other users. Users are typically marked as primary during
				signup if they are not already linked to another user.
			</Text>
		</Box>
	);
};

export default function EditUserModal({ open, handleClose, userId }: EditUserModalProps) {
	const { userDetails, tenants, updateUser, isUpdatingUser } = useUserDetails({ userId });
	const { showSuccessToast, showErrorToast } = useToast();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

	// Update local state when userDetails changes
	useEffect(() => {
		if (userDetails?.status === "OK") {
			setFirstName(userDetails.user.firstName || "");
			setLastName(userDetails.user.lastName || "");
		}
	}, [userDetails]);

	const handleSave = async () => {
		if (userDetails?.status !== "OK") return;

		try {
			const updatedUser: User = {
				...userDetails.user,
				firstName,
				lastName,
			};

			await updateUser({
				userId: userDetails.user.id,
				user: updatedUser,
				tenants,
			});

			showSuccessToast("User information updated successfully");
			handleClose();
		} catch (error) {
			showErrorToast("Failed to update user information");
		}
	};

	if (userDetails?.status !== "OK") {
		return null;
	}

	const user = userDetails.user;

	return (
		<Modal
			open={open}
			handleClose={handleClose}
			title="Edit User Information"
			size="sm">
			<Form className={styles["edit-user-modal"]}>
				<Form.Paper className={styles["edit-user-modal__paper"]}>
					<Flex
						mx="4"
						my="4"
						direction="column"
						gap="3">
						<Form.Item>
							<ItemLabel>First Name:</ItemLabel>
							<TextField
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
							/>
						</Form.Item>
						<Form.Item>
							<ItemLabel>Last Name:</ItemLabel>
							<TextField
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
							/>
						</Form.Item>
					</Flex>

					<Flex
						className={styles["edit-user-modal__footer"]}
						align="center"
						px="4"
						py="3">
						<ItemLabel mr="1">Primary User:</ItemLabel>
						<Tooltip
							className={styles["edit-user-modal__tooltip"]}
							content={<TooltipContent />}>
							<InfoCircledIcon
								width={14}
								height={14}
							/>
						</Tooltip>
						<Crystal ml="2">{user.isPrimaryUser ? "Yes" : "No"}</Crystal>
					</Flex>
				</Form.Paper>
				<Flex
					justify="end"
					mt="5">
					<Button
						size="3"
						onClick={handleSave}
						loading={isUpdatingUser}>
						Save
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
