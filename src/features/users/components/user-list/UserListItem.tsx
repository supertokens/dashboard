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

import { User } from "@features/users/types";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";
import { formatLongDate } from "@shared/utils";
import { useNavigationHelpers } from "@shared/navigation";

import styles from "./UserListItem.module.scss";

export const UserListItem = ({ user }: { user: User }) => {
	const { firstName, lastName, emails, timeJoined, loginMethods, phoneNumbers } = user;
	const methodFilter = loginMethods.filter((el) => el.recipeUserId === user.id);
	const email = methodFilter.length > 0 ? methodFilter[0].email : emails[0];
	const phone = methodFilter.length > 0 ? methodFilter[0].phoneNumber : phoneNumbers[0];
	const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
	const { goToUserDetail } = useNavigationHelpers();

	return (
		<Flex
			align="center"
			width="100%"
			className={styles["user-list__item"]}
			onClick={() => {
				goToUserDetail(user.id);
			}}>
			<Flex
				className={styles["user-list__item__details"]}
				direction="column"
				gap="1">
				{name && (
					<Text
						className={styles["user-list__item__details__name"]}
						size="3"
						weight="medium">
						{name}
					</Text>
				)}
				<Text
					className={styles["user-list__item__details__email"]}
					size="2"
					weight="medium">
					{email || phone}
				</Text>
			</Flex>
			{timeJoined && (
				<Text
					className={styles["user-list__item__time-joined"]}
					size="2"
					weight="medium">
					{formatLongDate(timeJoined)}
				</Text>
			)}
			<ChevronRightIcon
				height={16}
				width={16}
			/>
		</Flex>
	);
};
