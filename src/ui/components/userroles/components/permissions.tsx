/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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
import Button from "@components/radix/button";
import EmptyList from "@components/radix/empty";
import IconButton from "@components/radix/iconButton";
import ItemLabel from "@components/radix/itemLabel";
import Paper from "@components/radix/paper";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { Badge, Checkbox, Flex, Text } from "@radix-ui/themes";
import AddPermissionModal from "@components/radix/modals/addPermission";
import DeletePermissionModal from "@components/radix/modals/deletePermission";
import Loader from "@components/radix/loader";
import DashboardError from "@components/radix/error";
import { assertNever } from "@utils/assertNever";

import "./permissions.scss";

const PermissionsHeader = ({ selectedPermissions }: { selectedPermissions: string[] }) => {
	const [openAddPermissionModal, setOpenAddPermissionModal] = useState(false);
	const [openDeletePermissionModal, setOpenDeletePermissionModal] = useState(false);
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
					onClick={() => setOpenDeletePermissionModal(true)}>
					<TrashIcon />
				</IconButton>
				<Button
					size="2"
					onClick={() => setOpenAddPermissionModal(true)}>
					<PlusIcon /> Add Permissions
				</Button>
			</Flex>
			<AddPermissionModal
				open={openAddPermissionModal}
				handleClose={() => setOpenAddPermissionModal(false)}
			/>
			<DeletePermissionModal
				open={openDeletePermissionModal}
				handleClose={() => setOpenDeletePermissionModal(false)}
			/>
		</Flex>
	);
};

const PermissionsTable = ({
	permissions,
	hoveredPermission,
	setHoveredPermission,
	selectedPermissions,
	setSelectedPermissions,
}: {
	permissions: string[];
	hoveredPermission: string | null;
	setHoveredPermission: (permission: string | null) => void;
	selectedPermissions: string[];
	setSelectedPermissions: (permissions: string[]) => void;
}) => {
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
							{
								<Text
									className={`permissions__table__item__text ${
										selectedPermissions.includes(permission)
											? "permissions__table__item__text--selected"
											: ""
									} ${
										hoveredPermission === permission
											? "permissions__table__item__text--hovered"
											: ""
									}`}
									size="2"
									weight="medium">
									{permission}
								</Text>
							}
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

export default function Permissions() {
	const permissions: string[] = ["view", "edit", "delete"];
	const [hoveredPermission, setHoveredPermission] = useState<string | null>(null);
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [state, setState] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");

	switch (state) {
		case "LOADING":
			return <Loader type="table-with-list" />;
		case "SUCCESS":
			return (
				<Flex
					direction="column"
					width="100%">
					<PermissionsHeader selectedPermissions={selectedPermissions} />
					<PermissionsTable
						permissions={permissions}
						hoveredPermission={hoveredPermission}
						setHoveredPermission={setHoveredPermission}
						selectedPermissions={selectedPermissions}
						setSelectedPermissions={setSelectedPermissions}
					/>
				</Flex>
			);
		case "ERROR":
			return <DashboardError />;
		default:
			return assertNever(state);
	}
}
