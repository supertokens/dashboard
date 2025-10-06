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

import { useContext, useMemo, useState } from "react";
import { Badge, Checkbox, Flex, Text } from "@radix-ui/themes";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";
import EmptyList from "@shared/components/empty";
import IconButton from "@shared/components/iconButton";
import ItemLabel from "@shared/components/itemLabel";
import Paper from "@shared/components/paper";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import { PopupContentContext } from "@contexts/PopupContentContext";
import { assertNever } from "@utils/assertNever";
import { getImageUrl } from "@utils/index";

import AddPermissionModal from "../modals/addPermission";
import DeletePermissionModal from "../modals/deletePermission";
import { useRoleDetails } from "../hooks";

import "./Permissions.module.scss";

interface PermissionsHeaderProps {
	selectedPermissions: string[];
	onAddPermission: () => void;
	onDeletePermissions: () => void;
}

const PermissionsHeader = ({ selectedPermissions, onAddPermission, onDeletePermissions }: PermissionsHeaderProps) => {
	return (
		<Flex
			className="permissions__header"
			justify="between"
			align="center"
			width="100%">
			<ItemLabel className="permissions__header__label">Permissions</ItemLabel>
			<Flex
				className="permissions__header__actions"
				gap="2">
				<IconButton
					color="red"
					disabled={selectedPermissions.length === 0}
					variant="soft"
					size="2"
					onClick={onDeletePermissions}>
					<TrashIcon />
				</IconButton>
				<Button
					size="2"
					onClick={onAddPermission}>
					<PlusIcon /> Add Permissions
				</Button>
			</Flex>
		</Flex>
	);
};

interface PermissionsTableProps {
	permissions: string[];
	hoveredPermission: string | null;
	setHoveredPermission: (permission: string | null) => void;
	selectedPermissions: string[];
	setSelectedPermissions: (permissions: string[]) => void;
}

const PermissionsTable = ({
	permissions,
	hoveredPermission,
	setHoveredPermission,
	selectedPermissions,
	setSelectedPermissions,
}: PermissionsTableProps) => {
	if (permissions.length === 0) {
		return (
			<Flex
				className="permissions__table__empty"
				justify="center"
				align="center"
				width="100%">
				<EmptyList
					iconUrl="key-shield.svg"
					title="No permissions assigned"
					description="This role currently has no permissions. Click 'Add Permissions' above to assign permissions to this role."
				/>
			</Flex>
		);
	}
	return (
		<Flex
			className="permissions__table"
			width="100%">
			<Paper
				width="100%"
				withBackground
				withBorder
				m="3"
				p="0"
				className="permissions__table__paper">
				{permissions.map((permission) => (
					<Flex
						justify="between"
						align="center"
						className={`permissions__table__item ${
							selectedPermissions.includes(permission) ? "permissions__table__item--selected" : ""
						}`}
						key={permission}
						onMouseEnter={() => setHoveredPermission(permission)}
						onMouseLeave={() => setHoveredPermission(null)}>
						<Badge
							variant="soft"
							size="2"
							radius="full"
							className={`permissions__table__item__badge ${
								selectedPermissions.includes(permission)
									? "permissions__table__item__badge--selected"
									: ""
							} ${hoveredPermission === permission ? "permissions__table__item__badge--hovered" : ""}`}>
							<Text
								className={`permissions__table__item__text ${
									selectedPermissions.includes(permission)
										? "permissions__table__item__text--selected"
										: ""
								} ${hoveredPermission === permission ? "permissions__table__item__text--hovered" : ""}`}
								size="2"
								weight="medium">
								{permission}
							</Text>
						</Badge>
						{(hoveredPermission === permission || selectedPermissions.includes(permission)) && (
							<Checkbox
								checked={selectedPermissions.includes(permission)}
								onCheckedChange={() => {
									if (selectedPermissions.includes(permission)) {
										setSelectedPermissions(selectedPermissions.filter((p) => p !== permission));
									} else {
										setSelectedPermissions([...selectedPermissions, permission]);
									}
								}}
							/>
						)}
					</Flex>
				))}
			</Paper>
		</Flex>
	);
};

export default function Permissions({ roleId }: { roleId: string }) {
	const { showToast } = useContext(PopupContentContext);
	const {
		permissions,
		isLoading,
		error,
		refetch,
		addPermissions,
		removePermissions,
		isAddingPermissions,
		isRemovingPermissions,
	} = useRoleDetails(roleId);

	const [hoveredPermission, setHoveredPermission] = useState<string | null>(null);
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [openAddPermissionModal, setOpenAddPermissionModal] = useState(false);
	const [openDeletePermissionModal, setOpenDeletePermissionModal] = useState(false);

	const handleAddPermissions = async (newPermissions: string[]) => {
		try {
			const response = await addPermissions(newPermissions);

			if (!response) {
				throw new Error("Failed to add permissions");
			}

			if (response.status === "OK") {
				showToast({
					iconImage: getImageUrl("checkmark-green.svg"),
					toastType: "success",
					children: <>Permissions added successfully!</>,
				});
				setOpenAddPermissionModal(false);
				await refetch();
			} else if (response.status === "UNKNOWN_ROLE_ERROR") {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Role not found</>,
				});
			} else {
				throw new Error("Failed to add permissions");
			}
		} catch {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong. Please try again!</>,
			});
		}
	};

	const handleDeletePermissions = async () => {
		try {
			const response = await removePermissions(selectedPermissions);

			if (!response) {
				throw new Error("Failed to remove permissions");
			}

			if (response.status === "OK") {
				showToast({
					iconImage: getImageUrl("checkmark-green.svg"),
					toastType: "success",
					children: <>Permissions removed successfully!</>,
				});
				setSelectedPermissions([]);
				setOpenDeletePermissionModal(false);
				await refetch();
			} else if (response.status === "UNKNOWN_ROLE_ERROR") {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Role not found</>,
				});
			} else {
				throw new Error("Failed to remove permissions");
			}
		} catch {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong. Please try again!</>,
			});
		}
	};

	const pageState = useMemo(() => {
		if (isLoading) return "LOADING";
		if (error) return "ERROR";
		return "SUCCESS";
	}, [isLoading, error]);

	switch (pageState) {
		case "LOADING":
			return <Loader type="table-with-list" />;
		case "SUCCESS":
			return (
				<Flex
					direction="column"
					width="100%">
					<PermissionsHeader
						selectedPermissions={selectedPermissions}
						onAddPermission={() => setOpenAddPermissionModal(true)}
						onDeletePermissions={() => setOpenDeletePermissionModal(true)}
					/>
					<PermissionsTable
						permissions={permissions}
						hoveredPermission={hoveredPermission}
						setHoveredPermission={setHoveredPermission}
						selectedPermissions={selectedPermissions}
						setSelectedPermissions={setSelectedPermissions}
					/>
					<AddPermissionModal
						open={openAddPermissionModal}
						handleClose={() => setOpenAddPermissionModal(false)}
						roleId={roleId}
						existingPermissions={permissions}
						onAddPermissions={handleAddPermissions}
						isAdding={isAddingPermissions}
					/>
					<DeletePermissionModal
						open={openDeletePermissionModal}
						handleClose={() => setOpenDeletePermissionModal(false)}
						roleId={roleId}
						selectedPermissions={selectedPermissions}
						onDeletePermissions={handleDeletePermissions}
						isDeleting={isRemovingPermissions}
					/>
				</Flex>
			);
		case "ERROR":
			return <DashboardError />;
		default:
			return assertNever(pageState);
	}
}
