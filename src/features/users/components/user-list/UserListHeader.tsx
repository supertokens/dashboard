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

import { useTenantsListContext } from "@contexts/TenantsListContext";
import { PlusIcon } from "@radix-ui/react-icons";
import { Box, Flex, IconButton, Select, Text } from "@radix-ui/themes";
import { useState } from "react";
import { getImageUrl, isSearchEnabled } from "@shared/utils";
import Search from "@shared/components/search";
import Button from "@shared/components/button";

import styles from "./UserListHeader.module.scss";
import { CreateUserModal } from "@shared/components/modals/create-user";

export const UserListHeader = ({
	onTenantChange,
	loadCount,
}: {
	onTenantChange: () => void;
	loadCount: () => void;
}) => {
	const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
	const { getSelectedTenant, setSelectedTenant, tenantsListFromStore } = useTenantsListContext();
	const selectedTenant = getSelectedTenant();

	return (
		<Flex
			justify="between"
			gap="8"
			mb="4"
			className={styles["user-list__header"]}>
			<Flex
				flexGrow="1"
				gap="2"
				maxWidth="600px">
				{isSearchEnabled() && (
					<Box className={styles["user-list__header__search"]}>
						<Search
							onSearch={() => {
								return Promise.resolve();
							}}
							isLoading={false}
							placeholder="Search User"
						/>
					</Box>
				)}

				<Select.Root
					size="2"
					value={selectedTenant}
					onValueChange={(value) => {
						setSelectedTenant(value);
						onTenantChange();
					}}>
					<Select.Trigger
						variant="surface"
						className={styles["user-list__header__select"]}>
						<Flex
							as="span"
							align="center"
							gap="2">
							<Text
								size="2"
								weight="regular"
								className={styles["user-list__header__select__text--gray"]}>
								Tenant ID:
							</Text>
							<Text
								size="2"
								weight="medium"
								className={styles["user-list__header__select__text--solid"]}>
								{selectedTenant}
							</Text>
						</Flex>
					</Select.Trigger>
					{tenantsListFromStore && (
						<Select.Content position="popper">
							{tenantsListFromStore.map((tenant) => (
								<Select.Item
									key={tenant.tenantId}
									value={tenant.tenantId}>
									{tenant.tenantId}
								</Select.Item>
							))}
						</Select.Content>
					)}
				</Select.Root>
				<IconButton
					size="2"
					variant="soft"
					color="gray">
					<img
						src={getImageUrl("filter-icon.svg")}
						alt="filter-icon"
					/>
				</IconButton>
			</Flex>
			<Button
				onClick={() => setShowCreateUserDialog(true)}
				size="2"
				variant="solid">
				<PlusIcon />
				Add User
			</Button>
			{showCreateUserDialog && (
				<CreateUserModal
					handleClose={() => setShowCreateUserDialog(false)}
					tenants={tenantsListFromStore ?? []}
					loadCount={loadCount}
				/>
			)}
		</Flex>
	);
};
