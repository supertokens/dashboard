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

import { Box, Flex, Text } from "@radix-ui/themes";

import EmptyList from "@shared/components/empty";

import RolesListItem from "./RolesListItem";
import styles from "./RolesListTable.module.scss";

interface RolesListTableProps {
	roles: Array<{ role: string; permissions: string[] | undefined }>;
	isFeatureEnabled: boolean;
}

export default function RolesListTable({ roles, isFeatureEnabled }: RolesListTableProps) {
	const isEmpty = roles.length === 0;
	const isFeatureDisabled = !isFeatureEnabled;

	return (
		<Box className={styles.table}>
			<Flex
				align="center"
				className={styles.table__header}>
				<Text
					size="2"
					weight="medium"
					className={styles.table__header__roles}>
					User Roles
				</Text>
				<Text
					size="2"
					weight="medium"
					className={styles.table__header__permissions}>
					Permissions
				</Text>
			</Flex>
			<Flex direction="column">
				{isFeatureDisabled ? (
					<EmptyList
						iconUrl="danger.svg"
						title="Feature is not enabled"
						description={
							<span>
								Enable this feature to manage user roles and permissions. Start by initialising the
								UserRoles recipe in the recipeList on the backend.{" "}
								<a
									href="https://supertokens.com/docs/post-authentication/dashboard/user-management"
									target="_blank"
									rel="noopener noreferrer">
									Click here
								</a>{" "}
								for more details.
							</span>
						}
					/>
				) : isEmpty ? (
					<EmptyList
						iconUrl="permission.svg"
						title="There are no roles created"
						description="Once added, all created user roles will be found here"
					/>
				) : (
					roles.map(({ role, permissions }) => (
						<RolesListItem
							key={role}
							role={role}
							permissions={permissions}
						/>
					))
				)}
			</Flex>
		</Box>
	);
}
