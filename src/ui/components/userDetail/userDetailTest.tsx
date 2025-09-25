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

import useUserService, { GetUserInfoResult, UpdateUserInformationResponse } from "@api/user";
import Button from "@components/radix/button";
import IconButton from "@components/radix/iconButton";
import ItemContainer from "@components/radix/itemContainer";
import ItemDetailHeader from "@components/radix/itemDetailsHeading";
import PageContainer from "@components/radix/pageContainer";
import { User } from "@pages/usersList/types";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Badge, Box, Em, Flex, Text } from "@radix-ui/themes";
import { doesTenantHavePasswordlessEnabled } from "@utils/index";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SessionInfo } from "./types";
import useMetadataService from "@api/user/metadata";
import useSessionsForUserService from "@api/user/sessions";
import { useToast } from "@components/radix/toast";
import { Tenant } from "@api/tenants/types";
import { getTenantsObjectsForIds } from "@utils/user";
import { FactorIds } from "@constants";
import { assertNever } from "@utils/assertNever";
import DashboardError from "@components/radix/error";
import Loader from "@components/radix/loader";
import EmptyList from "@components/radix/empty";
import Paper from "@components/radix/paper";

import "./userDetailTest.scss";
import ItemLabel from "@components/radix/itemLabel";
import CopyBox from "@components/radix/copyBox";
import TabSelector from "@components/radix/tabSelector";
import LoginMethods from "./loginMethods/LoginMethodsTest";
import Separator from "@components/radix/separator";
import Sessions from "./userDetailSessionListTest";
import EditUserModal from "@components/radix/modals/editUser";
import DeleteUserModal from "@components/radix/modals/deleteUser";
import Roles from "./userRoles/UserRolesListTest";
import MetaData from "./userMetaDataSectionTest";

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

const UserNameCard = ({ user }: { user: User }) => {
	const { firstName, lastName } = user;
	const userNameSet = !!(firstName && lastName);
	const [openEditUserModal, setOpenEditUserModal] = useState(false);

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
						className="user-detail__name-badge">
						{`${getFirstLetter(firstName)}${getFirstLetter(lastName)}`}
					</Badge>
					<Text className="user-detail__name-text">{`${firstName || ""} ${lastName || ""}`}</Text>
				</Flex>
			) : (
				<Em>
					<Text size="3">Set name</Text>
				</Em>
			)}
			<IconButton
				variant="soft"
				color="gray"
				onClick={() => {
					setOpenEditUserModal(true);
				}}>
				<Pencil1Icon />
			</IconButton>
			<EditUserModal
				open={openEditUserModal}
				handleClose={() => {
					setOpenEditUserModal(false);
				}}
			/>
		</Flex>
	);
};

const UserDetailContent = ({ user }: { user: User }) => {
	const [selectedTab, setSelectedTab] = useState<UserDetailTab>("login-methods");
	const [openDeleteUserModal, setOpenDeleteUserModal] = useState(false);
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
					<UserNameCard user={user} />
					<Button
						color="red"
						size="2"
						variant="soft"
						onClick={() => {
							setOpenDeleteUserModal(true);
						}}>
						<TrashIcon />
						Delete User
					</Button>
					<DeleteUserModal
						open={openDeleteUserModal}
						handleClose={() => {
							setOpenDeleteUserModal(false);
						}}
					/>
				</Flex>
				<Separator fullWidth />
				<Flex
					className="user-detail__user-id-container"
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

					<ItemLabel mr="2">29th March, 12:03 am</ItemLabel>
				</Flex>
			</ItemContainer>

			<ItemContainer>
				<TabSelector
					tabs={userDetailTabs}
					onTabChange={(tab) => handleTabChange(tab as UserDetailTab)}
					selectedTab={selectedTab}>
					{(() => {
						switch (selectedTab) {
							case "login-methods":
								return <LoginMethods />;
							case "sessions":
								return <Sessions />;
							case "roles":
								return <Roles />;
							case "metadata":
								return <MetaData />;
							default:
								return assertNever(selectedTab);
						}
					})()}
				</TabSelector>
			</ItemContainer>
		</Box>
	);
};

export default function UserDetailTest({ userId }: { userId: string }) {
	const navigate = useNavigate();
	const [userDetail, setUserDetail] = useState<GetUserInfoResult | undefined>(undefined);
	const [sessionList, setSessionList] = useState<SessionInfo[] | undefined>(undefined);
	const [userMetaData, setUserMetaData] = useState<string | undefined>(undefined);
	const [shouldShowLoadingOverlay, setShowLoadingOverlay] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(false);
	const [state, setState] = useState<"LOADING" | "IDLE" | "ERROR">("LOADING");

	const { getUser, updateUserInformation } = useUserService();
	const { getUserMetaData } = useMetadataService();
	const { getSessionsForUser } = useSessionsForUserService();
	const { showToast, showErrorToast, showSuccessToast } = useToast();

	const handleBackToItemList = () => {
		navigate("/");
	};

	const loadUserDetail = useCallback(async () => {
		const userDetailsResponse = await getUser(userId);
		const parsedResponse = JSON.parse(JSON.stringify(userDetailsResponse));
		setUserDetail(parsedResponse);
	}, []);

	const updateUser = useCallback(
		async (
			userId: string,
			data: User,
			tenantListFromStore: Tenant[] | undefined
		): Promise<
			| UpdateUserInformationResponse
			| {
					status: "NO_API_CALLED";
			  }
		> => {
			let tenantId: string | undefined;
			const tenants: Tenant[] = getTenantsObjectsForIds(tenantListFromStore ?? [], data.tenantIds);
			let matchingTenants: Tenant[] = [];

			const PrimaryLoginMethod = data.loginMethods.filter((el) => el.recipeUserId === data.id)[0];

			if (PrimaryLoginMethod.recipeId === "emailpassword") {
				matchingTenants = tenants.filter((tenant) => tenant.firstFactors.includes(FactorIds.EMAILPASSWORD));
			}

			if (PrimaryLoginMethod.recipeId === "passwordless") {
				matchingTenants = tenants.filter((tenant) => doesTenantHavePasswordlessEnabled(tenant.firstFactors));
			}

			if (PrimaryLoginMethod.recipeId === "thirdparty") {
				matchingTenants = tenants.filter((tenant) => tenant.firstFactors.includes(FactorIds.THIRDPARTY));
			}

			if (matchingTenants.length > 0) {
				tenantId = matchingTenants[0].tenantId;
			}

			if (tenantId === undefined) {
				setShowLoadingOverlay(false);
				showToast({
					title: "Operation not allowed",
					type: "error",
					description: `User does not belong to a tenant that has the ${PrimaryLoginMethod.recipeId} recipe enabled`,
				});
				return {
					status: "NO_API_CALLED",
				};
			}

			const userInfoResponse = await updateUserInformation({
				userId,
				recipeId: PrimaryLoginMethod.recipeId,
				recipeUserId: PrimaryLoginMethod.recipeUserId,
				email: PrimaryLoginMethod.email,
				phone: PrimaryLoginMethod.recipeId === "passwordless" ? PrimaryLoginMethod.phoneNumber : "",
				firstName: data.firstName,
				lastName: data.lastName,
				tenantId,
			});
			if (userInfoResponse.status === "OK") {
				showSuccessToast("User information updated successfully");
			} else {
				showErrorToast("Failed to update user information");
			}

			return userInfoResponse;
		},
		[]
	);

	const fetchUserMetaData = useCallback(async () => {
		const metaDataResponse = await getUserMetaData(userId);
		if (metaDataResponse === "FEATURE_NOT_ENABLED_ERROR") {
			setUserMetaData("Feature Not Enabled");
		} else if (metaDataResponse !== undefined) {
			setUserMetaData(JSON.stringify(metaDataResponse));
		} else {
			setUserMetaData("{}");
		}
	}, []);

	const fetchSession = useCallback(async () => {
		let response = await getSessionsForUser(userId);

		if (response === undefined) {
			response = [];
		}

		setSessionList(response);
	}, []);

	const fetchData = async () => {
		setState("LOADING");
		try {
			await loadUserDetail();
			await fetchUserMetaData();
			await fetchSession();
			setState("IDLE");
		} catch (e) {
			setState("ERROR");
		}
	};

	useEffect(() => {
		void fetchData();
	}, []);

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
					switch (state) {
						case "ERROR":
							return <DashboardError />;
						case "IDLE":
							if (!userDetail) return null;
							switch (userDetail.status) {
								case "OK":
									return <UserDetailContent user={userDetail.user} />;
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
									return assertNever(userDetail);
							}

						case "LOADING":
							return <Loader type="table-with-list" />;
						default:
							assertNever(state);
					}
				})()}
			</Flex>
		</PageContainer>
	);
}
