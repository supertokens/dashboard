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
import { useNavigate } from "react-router-dom";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Badge, Box, Em, Flex, Text } from "@radix-ui/themes";

import Button from "@shared/components/button";
import IconButton from "@shared/components/iconButton";
import ItemContainer from "@shared/components/itemContainer";
import ItemDetailHeader from "@shared/components/itemDetailsHeading";
import PageContainer from "@shared/components/pageContainer";
import ItemLabel from "@shared/components/itemLabel";
import CopyBox from "@shared/components/copyBox";
import TabSelector from "@shared/components/tabSelector";
import Separator from "@shared/components/separator";
import Loader from "@shared/components/loader";
import EmptyList from "@shared/components/empty";
import Paper from "@shared/components/paper";
import DashboardError from "@shared/components/error";

import { assertNever } from "@utils/assertNever";
import { useUserDetails } from "@features/users/hooks/useUserDetails";
import { User } from "@features/users/types";

import Sessions from "./sessions/Sessions";
import Roles from "./roles/Roles";
import MetaData from "./metadata/MetaData";
import LoginMethods from "./login-methods/LoginMethods";
import { EditUserModal, DeleteUserModal } from "./modals";

import styles from "./UserDetails.module.scss";

const getFirstLetter = (name: string | undefined) => {
	return `${name?.[0] || ""}`;
};

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
	readonly onEditClick: () => void;
}

const UserNameCard = ({ user, onEditClick }: UserNameCardProps) => {
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
				onClick={onEditClick}>
				<Pencil1Icon />
			</IconButton>
		</Flex>
	);
};

interface UserDetailContentProps {
	readonly user: User;
	readonly userId: string;
	readonly onDeleteClick: () => void;
	readonly onEditClick: () => void;
}

const UserDetailContent = ({ user, userId, onDeleteClick, onEditClick }: UserDetailContentProps) => {
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
						onEditClick={onEditClick}
					/>
					<Button
						color="red"
						size="2"
						variant="soft"
						onClick={onDeleteClick}>
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
					<ItemLabel mr="2">{new Date(user.timeJoined).toLocaleDateString()}</ItemLabel>
				</Flex>
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
							return <Sessions userId={userId} />;
						case "roles":
							return <Roles userId={userId} />;
						case "metadata":
							return <MetaData userId={userId} />;
						default:
							return assertNever(selectedTab);
					}
				})()}
			</TabSelector>
		</Box>
	);
};

interface UserDetailsProps {
	readonly userId: string;
}

export default function UserDetails({ userId }: UserDetailsProps) {
	const navigate = useNavigate();
	const [openEditUserModal, setOpenEditUserModal] = useState(false);
	const [openDeleteUserModal, setOpenDeleteUserModal] = useState(false);

	const { userDetails, isLoading, error } = useUserDetails({ userId });

	const handleBackToItemList = () => {
		navigate("/users");
	};

	const handleEditClick = () => {
		setOpenEditUserModal(true);
	};

	const handleDeleteClick = () => {
		setOpenDeleteUserModal(true);
	};

	return (
		<PageContainer>
			<Flex
				gap="4"
				direction="column">
				<ItemDetailHeader
					handleBackToItemList={handleBackToItemList}
					backToTitle="Back to User Management"
					breadcrumbParent="User Management"
					breadcrumbChild="User Details"
				/>

				{(() => {
					if (isLoading) {
						return <Loader type="table-with-list" />;
					}

					if (error) {
						return <DashboardError />;
					}

					if (!userDetails) {
						return null;
					}

					switch (userDetails.status) {
						case "OK":
							return (
								<>
									<UserDetailContent
										user={userDetails.user}
										userId={userId}
										onDeleteClick={handleDeleteClick}
										onEditClick={handleEditClick}
									/>

									{/* Modals */}
									<EditUserModal
										open={openEditUserModal}
										handleClose={() => setOpenEditUserModal(false)}
										userId={userId}
									/>
									<DeleteUserModal
										open={openDeleteUserModal}
										handleClose={() => setOpenDeleteUserModal(false)}
										userId={userId}
									/>
								</>
							);
						case "NO_USER_FOUND_ERROR":
							return (
								<Paper withBackground>
									<EmptyList
										iconUrl="user.svg"
										title="User not found"
										description="We couldn't locate this user in our system. They may have been deleted or you might not have permission to view their details."
									/>
								</Paper>
							);
						case "RECIPE_NOT_INITIALISED":
							return (
								<EmptyList
									iconUrl="user.svg"
									title="Recipe not initialised"
									description="The required authentication recipes have not been initialized in your SuperTokens configuration. Please refer to our documentation for instructions on enabling and configuring recipes."
								/>
							);
						default:
							return assertNever(userDetails);
					}
				})()}
			</Flex>
		</PageContainer>
	);
}
