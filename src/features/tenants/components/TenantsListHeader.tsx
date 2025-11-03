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

import { Box, Flex, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";

import styles from "./TenantsListHeader.module.scss";

interface TenantsListHeaderProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	onAddTenant: () => void;
	isLoading: boolean;
}

export default function TenantsListHeader({
	searchQuery,
	setSearchQuery,
	onAddTenant,
	isLoading,
}: TenantsListHeaderProps) {
	return (
		<Flex
			justify="between"
			gap="8"
			mb="4"
			className={styles["tenants-list-header"]}>
			<Flex
				flexGrow="1"
				gap="2">
				<Box className={styles["tenants-list-header__search"]}>
					<TextField.Root
						placeholder="Search Tenant"
						size="2"
						variant="surface"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}>
						<TextField.Slot>
							<MagnifyingGlassIcon
								height="16"
								width="16"
							/>
						</TextField.Slot>
					</TextField.Root>
				</Box>
			</Flex>
			<Button
				size="2"
				variant="solid"
				className={styles["tenants-list-header__btn"]}
				onClick={onAddTenant}
				disabled={isLoading}>
				<PlusIcon />
				Add Tenant
			</Button>
		</Flex>
	);
}
