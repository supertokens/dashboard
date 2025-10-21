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
import { Flex } from "@radix-ui/themes";

import ItemLabel from "@shared/components/itemLabel";
import Callout from "@shared/components/callout";
import Paper from "@shared/components/paper";

import { useRoles } from "@features/users/hooks";
import { RemoveRoleModal } from "../modals";
import RoleRow from "./RoleRow";

import styles from "./RolesList.module.scss";

interface RolesListProps {
	readonly userId: string;
	readonly selectedTenantId: string;
}

export default function RolesList({ userId, selectedTenantId }: RolesListProps) {
	const { roles } = useRoles(userId, selectedTenantId);
	const [openRemoveRoleModal, setOpenRemoveRoleModal] = useState(false);
	const [selectedRole, setSelectedRole] = useState<string>("");

	const handleRemoveClick = (role: string) => {
		setSelectedRole(role);
		setOpenRemoveRoleModal(true);
	};

	if (!roles || roles.status === "FEATURE_NOT_ENABLED_ERROR") {
		return (
			<Flex p="4">
				<Callout
					className={styles["roles-list__callout"]}
					type="info">
					User roles feature is not enabled.
				</Callout>
			</Flex>
		);
	}

	if (roles.status === "OK" && roles.roles.length === 0) {
		return (
			<Flex p="4">
				<Callout
					className={styles["roles-list__callout"]}
					type="info">
					This user currently has no roles assigned.
				</Callout>
			</Flex>
		);
	}

	if (roles.status !== "OK") {
		return null;
	}

	return (
		<Flex p="4">
			<Paper
				p="0"
				width="100%"
				className={styles["roles-list"]}>
				<Flex
					className={styles["roles-list__header"]}
					align="center"
					p="3">
					<ItemLabel className={styles["roles-list__header__role"]}>Roles</ItemLabel>
					<ItemLabel className={styles["roles-list__header__permission"]}>Permissions</ItemLabel>
					<ItemLabel className={styles["roles-list__header__action"]}>{""}</ItemLabel>
				</Flex>
				<Flex direction="column">
					{roles.roles.map((role) => (
						<RoleRow
							key={role}
							role={role}
							onRemoveClick={handleRemoveClick}
						/>
					))}
				</Flex>
			</Paper>
			<RemoveRoleModal
				open={openRemoveRoleModal}
				handleClose={() => setOpenRemoveRoleModal(false)}
				role={selectedRole}
				userIdProp={userId}
				selectedTenantId={selectedTenantId}
			/>
		</Flex>
	);
}
