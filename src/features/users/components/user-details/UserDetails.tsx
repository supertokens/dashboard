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

import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Badge, Box, Em, Flex, Text } from "@radix-ui/themes";

import Button from "@shared/components/button";
import IconButton from "@shared/components/iconButton";
import ItemContainer from "@shared/components/itemContainer";
import ItemLabel from "@shared/components/itemLabel";
import CopyBox from "@shared/components/copyBox";
import TabSelector from "@shared/components/tabSelector";
import Separator from "@shared/components/separator";

import { assertNever } from "@utils/assertNever";
import { formatLongDate } from "@shared/utils";
import { getFirstLetter } from "@shared/utils/getFirstLetter";

import { User } from "@features/users/types";

import Sessions from "./sessions/Sessions";
import Roles from "./roles/Roles";
import MetaData from "./metadata/MetaData";
import LoginMethods from "./login-methods/LoginMethods";

import styles from "./UserDetails.module.scss";
import EditUserModal from "./modals/EditUserModal";
import DeleteUserModal from "./modals/DeleteUserModal";

type UserDetailTab = "login-methods" | "sessions" | "roles" | "metadata";

const userDetailTabs: { name: string; value: UserDetailTab }[] = [
	{
		name: "Login Methods",
		value: "login-methods",
	},
	{
		name: "Sessions",
		value: "sessions",
	},
	{
		name: "Roles",
		value: "roles",
	},
	{
		name: "Metadata",
		value: "metadata",
	},
];

interface UserNameCardProps {
	readonly user: User;
	readonly onEditNameClick: () => void;
}

const UserNameCard = ({ user, onEditNameClick }: UserNameCardProps) => {
	const { firstName, lastName } = user;
	const userNameSet = !!(firstName && lastName);

	return (
		<Flex
			gap="2"
			align="center">
			{userNameSet ? (
				<Flex
					align="center"
					gap="4">
					<Badge
						variant="solid"
						size="3"
						className={styles["user-detail__name-badge"]}>
						{`${getFirstLetter(firstName)}${getFirstLetter(lastName)}`}
					</Badge>
					<Text className={styles["user-detail__name-text"]}>{`${firstName || ""} ${lastName || ""}`}</Text>
				</Flex>
			) : (
				<Em>
					<Text size="3">Set name</Text>
				</Em>
			)}
			<IconButton
				variant="soft"
				color="gray"
				onClick={onEditNameClick}>
				<Pencil1Icon />
			</IconButton>
		</Flex>
	);
};

interface UserDetailContentProps {
	readonly user: User;
}

export function UserDetailContent({ user }: UserDetailContentProps) {
	const [openEditUserModal, setOpenEditUserModal] = useState(false);
	const [openDeleteUserModal, setOpenDeleteUserModal] = useState(false);

	const [selectedTab, setSelectedTab] = useState<UserDetailTab>("login-methods");

	const handleTabChange = (tab: UserDetailTab) => {
		setSelectedTab(tab);
	};

	return (
		<Box width={"100%"}>
			<ItemContainer
				mb="4"
				p="0">
				<Flex
					align="center"
					justify="between"
					p="4">
					<UserNameCard
						user={user}
						onEditNameClick={() => setOpenEditUserModal(true)}
					/>
					<Button
						color="red"
						size="2"
						variant="soft"
						onClick={() => setOpenDeleteUserModal(true)}>
						<TrashIcon />
						Delete User
					</Button>
				</Flex>
				<Separator fullWidth />
				<Flex
					className={styles["user-detail__user-id-container"]}
					align="center"
					px="4"
					py="3">
					<Flex align="center">
						<ItemLabel mr="2">User ID:</ItemLabel>
						<CopyBox
							text={user.id}
							name="User ID"
							active
						/>
					</Flex>
					<Separator
						orientation="vertical"
						mx="5"
					/>
					<ItemLabel mr="2">{formatLongDate(user.timeJoined)}</ItemLabel>
				</Flex>
				{openEditUserModal && (
					<EditUserModal
						open={openEditUserModal}
						handleClose={() => setOpenEditUserModal(false)}
						userId={user.id}
					/>
				)}
				{openDeleteUserModal && (
					<DeleteUserModal
						open={openDeleteUserModal}
						handleClose={() => setOpenDeleteUserModal(false)}
						userId={user.id}
					/>
				)}
			</ItemContainer>

			<TabSelector
				tabs={userDetailTabs}
				onTabChange={(tab) => handleTabChange(tab as UserDetailTab)}
				selectedTab={selectedTab}>
				{(() => {
					switch (selectedTab) {
						case "login-methods":
							return <LoginMethods />;
						case "sessions":
							return <Sessions userId={user.id} />;
						case "roles":
							return <Roles userId={user.id} />;
						case "metadata":
							return <MetaData userId={user.id} />;
						default:
							return assertNever(selectedTab);
					}
				})()}
			</TabSelector>
		</Box>
	);
}
