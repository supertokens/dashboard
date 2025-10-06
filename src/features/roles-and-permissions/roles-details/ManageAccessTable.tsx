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

import { Flex, Text } from "@radix-ui/themes";

import EmptyList from "@shared/components/empty";
import Paper from "@shared/components/paper";
import Button from "@shared/components/button";
import { User } from "@features/users/types";

import styles from "./ManageAccessTable.module.scss";

interface ManageAccessTableProps {
	users: User[];
	onRemoveUser: (userId: string) => void;
}

export default function ManageAccessTable({ users, onRemoveUser }: ManageAccessTableProps) {
	if (users.length === 0) {
		return (
			<Flex
				px="3"
				py="4"
				justify="center"
				align="center"
				width="100%">
				<EmptyList
					iconUrl="user.svg"
					title="No users assigned"
					description="This role has not been assigned to any user yet"
				/>
			</Flex>
		);
	}

	return (
		<Paper
			className={styles["manage-access-table"]}
			withBorder={true}
			mx="3"
			my="4"
			p="0">
			<Flex
				direction="column"
				className={styles["manage-access-table__items"]}>
				{users.map((user) => (
					<Flex
						align="center"
						key={user.id}
						justify="between"
						className={styles["manage-access-table__item"]}
						p="3">
						<Flex
							direction="column"
							gap="1">
							<Text
								size="3"
								weight="medium">
								{user.firstName} {user.lastName}
							</Text>
							{user.emails[0] && (
								<Text
									size="2"
									weight="medium"
									color="gray">
									{user.emails[0]}
								</Text>
							)}
							{user.phoneNumbers[0] && (
								<Text
									size="2"
									weight="medium"
									color="gray">
									{user.phoneNumbers[0]}
								</Text>
							)}
						</Flex>
						<Button
							size="2"
							variant="outline"
							color="gray"
							onClick={() => onRemoveUser(user.id)}>
							Remove
						</Button>
					</Flex>
				))}
			</Flex>
		</Paper>
	);
}
