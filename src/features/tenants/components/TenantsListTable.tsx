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

import { Box, Flex, Text } from "@radix-ui/themes";

import type { Tenant } from "@api/tenants/types";
import EmptyList from "@shared/components/empty";

import { TENANTS_PAGINATION_LIMIT } from "../constants";
import TenantsListItem from "./TenantsListItem";

import styles from "./TenantsListTable.module.scss";
import { withOverride } from "@plugins";

interface TenantsListTableProps {
	tenants: Tenant[];
	currentPage: number;
	isSearching: boolean;
}

const TenantsListTable = withOverride(
	"TenantsListTable",
	function TenantsListTable({ tenants, currentPage, isSearching }: TenantsListTableProps) {
		const startIndex = (currentPage - 1) * TENANTS_PAGINATION_LIMIT;
		const endIndex = startIndex + TENANTS_PAGINATION_LIMIT;
		const paginatedTenants = tenants.slice(startIndex, endIndex);

		const getEmptyStateContent = () => {
			if (isSearching) {
				return {
					iconUrl: "tenant.svg",
					title: "No tenants found",
					description: "No tenants match your search criteria. Try adjusting your search.",
				};
			}

			return {
				iconUrl: "tenant.svg",
				title: "There are no tenants created",
				description: "Once added, all tenants will be found here",
			};
		};

		const emptyState = getEmptyStateContent();

		return (
			<Box className={styles["tenants-list-table"]}>
				<Flex
					align="center"
					className={styles["tenants-list-table__header"]}>
					<Text
						size="2"
						weight="medium"
						className={styles["tenants-list-table__header__tenant-id"]}>
						Tenant ID
					</Text>
					<Text
						size="2"
						weight="medium"
						className={styles["tenants-list-table__header__login-methods"]}>
						Login Methods
					</Text>
				</Flex>
				{tenants.length === 0 ? (
					<EmptyList
						iconUrl={emptyState.iconUrl}
						title={emptyState.title}
						description={emptyState.description}
					/>
				) : (
					<Flex direction="column">
						{paginatedTenants.map((tenant) => (
							<TenantsListItem
								key={tenant.tenantId}
								tenant={tenant}
							/>
						))}
					</Flex>
				)}
			</Box>
		);
	}
);

export default TenantsListTable;
