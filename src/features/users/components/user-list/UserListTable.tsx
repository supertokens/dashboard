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

import { Box, Flex, Text } from "@radix-ui/themes";
import { getImageUrl } from "@shared/utils";
import { useState } from "react";
import { User } from "@features/users/types";
import EmptyList from "@shared/components/empty";
import { UserListItem } from "./UserListItem";

import styles from "./UserListTable.module.scss";

export const UserListTable = ({ users }: { users: User[] }) => {
	const [sort, setSort] = useState<"asc" | "desc">("desc");

	return (
		<Box className={styles["users-list__table"]}>
			<Flex
				align="center"
				className={styles["users-list__table__header"]}>
				<Text
					size="2"
					weight="medium"
					className={styles["users-list__table__header__user"]}>
					Users
				</Text>
				<Text
					size="2"
					weight="medium"
					className={styles["users-list__table__header__time-joined"]}>
					Time Joined{" "}
					<img
						src={getImageUrl(sort === "asc" ? "sort-ascending.svg" : "sort-descending.svg")}
						alt="sort-ascending"
						onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
					/>
				</Text>
			</Flex>
			{users.length === 0 ? (
				<EmptyList
					iconUrl="user.svg"
					title="You don't have any users"
					description="Once added all users will be found here. If you are using the session management feature of SuperTokens, your users will not appear in this list."
				/>
			) : (
				<>
					<Flex direction="column">
						{users.map((user) => (
							<UserListItem
								key={user.emails[0]}
								user={user}
							/>
						))}
					</Flex>
				</>
			)}
		</Box>
	);
};
