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

import { useState, useEffect, useMemo } from "react";
import { Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import ItemLabel from "@shared/components/itemLabel";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import EmptyList from "@shared/components/empty";
import CheckboxGroup from "@shared/components/checkboxGroup";
import { useToast } from "@shared/components/toast";

import { useRolesService } from "@api/userroles/role";
import { useRoles } from "@features/users/hooks/useRoles";

import styles from "./AssignRoleModal.module.scss";
import { useNavigationHelpers } from "@shared/navigation";

interface AssignRoleModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly userId: string;
	readonly selectedTenantId: string;
}

type LoadingState = "LOADING" | "SUCCESS" | "EMPTY" | "ERROR";

export default function AssignRoleModal({ open, handleClose, userId, selectedTenantId }: AssignRoleModalProps) {
	const { addRole, isAddingRole, roles: userRoles } = useRoles(userId, selectedTenantId);
	const { showSuccessToast, showErrorToast } = useToast();
	const { getRoles } = useRolesService();
	const { goToRoles } = useNavigationHelpers();

	const [loadingState, setLoadingState] = useState<LoadingState>("LOADING");
	const [availableRoles, setAvailableRoles] = useState<string[]>([]);
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const [searchText, setSearchText] = useState("");

	useEffect(() => {
		const fetchAvailableRoles = async () => {
			setLoadingState("LOADING");
			setSelectedRoles([]);
			setSearchText("");

			try {
				const response = await getRoles();

				if (response?.status === "OK") {
					// Filter out roles that are already assigned to the user
					const currentUserRoles = userRoles?.status === "OK" ? userRoles.roles : [];
					const unassignedRoles = response.roles.filter((role) => !currentUserRoles.includes(role));

					if (unassignedRoles.length === 0) {
						setLoadingState("EMPTY");
					} else {
						setAvailableRoles(unassignedRoles);
						setLoadingState("SUCCESS");
					}
				} else if (response?.status === "FEATURE_NOT_ENABLED_ERROR") {
					setLoadingState("EMPTY");
				} else {
					setLoadingState("ERROR");
				}
			} catch (error) {
				setLoadingState("ERROR");
				showErrorToast("Failed to fetch available roles");
			}
		};

		if (open) {
			void fetchAvailableRoles();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const filteredRoles = useMemo(() => {
		if (!searchText) return availableRoles;
		return availableRoles.filter((role) => role.toLowerCase().includes(searchText.toLowerCase()));
	}, [availableRoles, searchText]);

	const handleAssign = async () => {
		if (selectedRoles.length === 0) return;

		let successCount = 0;
		let failedCount = 0;

		for (const role of selectedRoles) {
			try {
				const response = await addRole({
					userId,
					role,
					tenantId: selectedTenantId,
				});

				if (response?.status === "OK") {
					successCount++;
				} else {
					failedCount++;
				}
			} catch (error) {
				failedCount++;
			}
		}

		if (successCount > 0) {
			showSuccessToast(
				successCount === 1 ? "Role assigned successfully" : `${successCount} roles assigned successfully`
			);
		}

		if (failedCount > 0) {
			showErrorToast(failedCount === 1 ? "Failed to assign 1 role" : `Failed to assign ${failedCount} roles`);
		}

		if (successCount > 0) {
			setSelectedRoles([]);
			handleClose();
		}
	};

	const renderContent = () => {
		switch (loadingState) {
			case "LOADING":
				return <Loader type="list" />;

			case "EMPTY":
				return (
					<EmptyList
						iconUrl="key-shield.svg"
						title="No roles available to assign"
						description={
							<Text className={styles["assign-role-modal__empty-list__description"]}>
								All available roles have been assigned or no roles exist.{" "}
								<a onClick={goToRoles}>Click here</a> to create new roles.
							</Text>
						}
					/>
				);

			case "ERROR":
				return <DashboardError withBackground={false} />;

			case "SUCCESS":
				return (
					<>
						<Flex
							p="3"
							className={styles["assign-role-modal__search"]}>
							<TextField.Root
								placeholder="Search for a role"
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								className={styles["assign-role-modal__search-field"]}>
								<TextField.Slot>
									<MagnifyingGlassIcon />
								</TextField.Slot>
							</TextField.Root>
						</Flex>
						<Flex
							px="3"
							py="1"
							className={styles["assign-role-modal__list-header"]}>
							<ItemLabel>Roles</ItemLabel>
						</Flex>
						<Box p="3">
							{filteredRoles.length === 0 ? (
								<Text
									size="2"
									color="gray">
									No roles match your search
								</Text>
							) : (
								<Flex className={styles["assign-role-modal__list"]}>
									<CheckboxGroup.Root
										value={selectedRoles}
										onValueChange={setSelectedRoles}
										name="roles"
										className={styles["assign-role-modal__list-items"]}>
										{filteredRoles.map((role) => (
											<CheckboxGroup.Item
												key={role}
												className={styles["assign-role-modal__list-items__item"]}
												value={role}>
												{role}
											</CheckboxGroup.Item>
										))}
									</CheckboxGroup.Root>
								</Flex>
							)}
						</Box>
					</>
				);

			default:
				return null;
		}
	};

	return (
		<Modal
			title="Assign User Roles"
			open={open}
			handleClose={handleClose}
			size="md">
			<Form className={styles["assign-role-modal"]}>
				<Form.Paper
					p="0"
					className={styles["assign-role-modal__paper"]}>
					<Flex
						direction="column"
						className={styles["assign-role-modal__header"]}
						p="3">
						<ItemLabel>Select roles you want to add</ItemLabel>
					</Flex>
					{renderContent()}
				</Form.Paper>
				<Flex
					justify="end"
					mt="4">
					<Button
						size="3"
						onClick={handleAssign}
						disabled={selectedRoles.length === 0 || isAddingRole}
						loading={isAddingRole}>
						{selectedRoles.length === 0
							? "Done"
							: `Assign ${selectedRoles.length} ${selectedRoles.length === 1 ? "Role" : "Roles"}`}
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
