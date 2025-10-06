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

import { Badge, Checkbox, Flex, Text } from "@radix-ui/themes";

import EmptyList from "@shared/components/empty";
import Paper from "@shared/components/paper";

import styles from "./PermissionsTable.module.scss";

interface PermissionsTableProps {
	permissions: string[];
	hoveredPermission: string | null;
	setHoveredPermission: (permission: string | null) => void;
	selectedPermissions: string[];
	setSelectedPermissions: (permissions: string[]) => void;
}

export default function PermissionsTable({
	permissions,
	hoveredPermission,
	setHoveredPermission,
	selectedPermissions,
	setSelectedPermissions,
}: PermissionsTableProps) {
	if (permissions.length === 0) {
		return (
			<Flex
				className={styles["permissions-table__empty"]}
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
			className={styles["permissions-table"]}
			width="100%">
			<Paper
				width="100%"
				withBackground
				withBorder
				m="4"
				p="0"
				className={styles["permissions-table__paper"]}>
				{permissions.map((permission) => (
					<Flex
						justify="between"
						align="center"
						className={`${styles["permissions-table__item"]} ${
							selectedPermissions.includes(permission) ? styles["permissions-table__item--selected"] : ""
						}`}
						key={permission}
						onMouseEnter={() => setHoveredPermission(permission)}
						onMouseLeave={() => setHoveredPermission(null)}>
						<Badge
							variant="soft"
							size="2"
							radius="full"
							className={`${styles["permissions-table__item__badge"]} ${
								selectedPermissions.includes(permission)
									? styles["permissions-table__item__badge--selected"]
									: ""
							} ${
								hoveredPermission === permission
									? styles["permissions-table__item__badge--hovered"]
									: ""
							}`}>
							<Text
								className={`${styles["permissions-table__item__text"]} ${
									selectedPermissions.includes(permission)
										? styles["permissions-table__item__text--selected"]
										: ""
								} ${
									hoveredPermission === permission
										? styles["permissions-table__item__text--hovered"]
										: ""
								}`}
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
}
