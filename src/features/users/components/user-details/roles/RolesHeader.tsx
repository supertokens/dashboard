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
import { PlusIcon } from "@radix-ui/react-icons";

import ItemLabel from "@shared/components/itemLabel";
import Separator from "@shared/components/separator";
import Button from "@shared/components/button";
import Select from "@shared/components/select";

import { useTenants } from "@features/tenants/hooks/useTenants";
import { AssignRoleModal } from "../modals";

import styles from "./RolesHeader.module.scss";

interface RolesHeaderProps {
	readonly userId: string;
	readonly selectedTenantId: string;
	readonly onTenantChange: (tenantId: string) => void;
}

export default function RolesHeader({ userId, selectedTenantId, onTenantChange }: RolesHeaderProps) {
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
				className={styles["roles-header"]}
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
						triggerClassName={styles["roles-header__select"]}
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
}
