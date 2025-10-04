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
import { Box, Flex } from "@radix-ui/themes";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";

import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import ItemLabel from "@shared/components/itemLabel";
import Separator from "@shared/components/separator";
import Button from "@shared/components/button";
import Select from "@shared/components/select";
import Callout from "@shared/components/callout";
import Paper from "@shared/components/paper";
import Crystal from "@shared/components/crystal";
import IconButton from "@shared/components/iconButton";

import { useRoles } from "@features/users/hooks/useRoles";
import { useTenants } from "@features/tenants/hooks/useTenants";
import { AssignRoleModal, RemoveRoleModal } from "../modals";

import styles from "./Roles.module.scss";

interface RolesHeaderProps {
	readonly userId: string;
	readonly selectedTenantId: string;
	readonly onTenantChange: (tenantId: string) => void;
}

const RolesHeader = ({ userId, selectedTenantId, onTenantChange }: RolesHeaderProps) => {
	const { tenants } = useTenants();
	const [openAssignRoleModal, setOpenAssignRoleModal] = useState(false);

	const tenantItems =
		tenants?.map((tenant) => ({
			label: tenant.tenantId === "public" ? "Public" : tenant.tenantId,
			value: tenant.tenantId,
		})) || [];

	return (
		<Box width="100%">
			<Flex
				className={styles["roles__header"]}
				justify="between"
				align="center"
				px="4"
				py="3">
				<Flex align="center">
					<ItemLabel mr="2">All roles assigned to the user for tenant: </ItemLabel>
					<Select
						items={tenantItems}
						onValueChange={onTenantChange}
						selectedValue={selectedTenantId || ""}
						triggerClassName={styles["roles__header__select"]}
					/>
				</Flex>
				<Button
					size="2"
					onClick={() => setOpenAssignRoleModal(true)}>
					<PlusIcon />
					Assign Role
				</Button>
			</Flex>
			<AssignRoleModal
				open={openAssignRoleModal}
				handleClose={() => setOpenAssignRoleModal(false)}
				userId={userId}
				selectedTenantId={selectedTenantId}
			/>
			<Separator fullWidth />
		</Box>
	);
};

interface RolesListProps {
	readonly userId: string;
	readonly selectedTenantId: string;
}

const RolesList = ({ userId, selectedTenantId }: RolesListProps) => {
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
				<Flex
					className={styles["roles-list__body"]}
					direction="column">
					{roles.roles.map((role) => (
						<Flex
							key={role}
							align="center"
							p="3"
							className={styles["roles-list__body__item"]}>
							<ItemLabel className={styles["roles-list__body__role"]}>{role}</ItemLabel>
							<Flex
								align="center"
								gap="2"
								className={styles["roles-list__body__permission"]}>
								<Crystal>No permissions data</Crystal>
							</Flex>

							<Flex
								className={styles["roles-list__body__action"]}
								justify="end"
								align="center">
								<IconButton
									variant="soft"
									size="2"
									color="red"
									onClick={() => handleRemoveClick(role)}>
									<TrashIcon />
								</IconButton>
							</Flex>
						</Flex>
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
};

interface RolesProps {
	readonly userId: string;
}

export default function Roles({ userId }: RolesProps) {
	const [selectedTenantId, setSelectedTenantId] = useState<string>("public");
	const { isLoading, error } = useRoles(userId, selectedTenantId);

	const handleTenantChange = (tenantId: string) => {
		setSelectedTenantId(tenantId);
	};

	if (isLoading) {
		return (
			<Flex
				width="100%"
				p="3">
				<Loader type="list" />
			</Flex>
		);
	}

	if (error) {
		return <DashboardError withBackground={false} />;
	}

	return (
		<Flex
			width="100%"
			direction="column">
			<RolesHeader
				userId={userId}
				selectedTenantId={selectedTenantId}
				onTenantChange={handleTenantChange}
			/>
			<RolesList
				userId={userId}
				selectedTenantId={selectedTenantId}
			/>
		</Flex>
	);
}
