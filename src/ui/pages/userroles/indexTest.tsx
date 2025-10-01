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

import Paper from "@shared/components/paper";
import DashboardError from "@shared/components/error";
import PageContainer from "@shared/components/pageContainer";
import PageHeading from "@shared/components/pageHeading";
import { useContext, useEffect } from "react";
import { PopupContentContext } from "@contexts/PopupContentContext";
import { useState } from "react";
import useRolesService from "@api/userroles/role";
import Loader from "@shared/components/loader";
import { assertNever } from "@utils/assertNever";
import { Badge, Box, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import Button from "@shared/components/button";

import "./indexTest.scss";
import EmptyList from "@shared/components/empty";
import CreateNewRoleModal from "@shared/components/modals/createNewRole";
import { useNavigate, useSearchParams } from "react-router-dom";
import RoleDetails from "@components/userroles/components/roleDetails";

export const USER_ROLES_PAGINATION_LIMIT = 10;

type RoleWithOrWithoutPermissions = {
	role: string;
	//	 undefined suggests that the permissions for this particular role is not being fetched on client.
	permissions: undefined | string[];
};

const UserRolesAndPermissionsHeader = () => {
	const [addNewRoleModalOpen, setAddNewRoleModalOpen] = useState(false);
	return (
		<Flex
			justify="between"
			align="center"
			gap="8"
			mb="4"
			className="user-roles-and-permissions-list__header">
			<Flex
				flexGrow="1"
				gap="2"
				align="center"
				maxWidth="600px">
				<TextField.Root
					placeholder="Search by role name"
					size="2"
					variant="surface"
					className="user-roles-and-permissions-list__header__search">
					<TextField.Slot>
						<MagnifyingGlassIcon
							height="16"
							width="16"
						/>
					</TextField.Slot>
				</TextField.Root>
			</Flex>
			<Button
				size="2"
				variant="solid"
				className="user-roles-and-permissions-list__header__btn"
				onClick={() => setAddNewRoleModalOpen(true)}>
				<PlusIcon />
				Add Role
			</Button>
			<CreateNewRoleModal
				handleClose={() => setAddNewRoleModalOpen(false)}
				open={addNewRoleModalOpen}
			/>
		</Flex>
	);
};

const UserRolesAndPermissionsFooter = () => {
	return (
		<Flex
			align="center"
			justify="end"
			gap="3"
			className="user-roles-and-permissions-list__table__footer"
			mt="4">
			<Text
				size="2"
				weight="medium">
				1 - 10 of 54
			</Text>
			<Flex gap="3">
				<IconButton
					size="2"
					variant="soft"
					color="gray">
					<ChevronLeftIcon />
				</IconButton>
				<IconButton
					size="2"
					variant="soft"
					color="gray">
					<ChevronRightIcon />
				</IconButton>
			</Flex>
		</Flex>
	);
};

const UserRolesAndPermissionsItem = ({
	role,
	permissions,
	isLast,
}: {
	role: string;
	permissions: undefined | string[];
	isLast: boolean;
}) => {
	const navigate = useNavigate();
	return (
		<Flex
			align="center"
			width="100%"
			onClick={() => {
				navigate(`/roles?roleid=${role}`);
			}}
			className={`user-roles-and-permissions-list__table__item ${
				isLast ? "user-roles-and-permissions-list__table__item--last" : ""
			}`}>
			<Text
				className="user-roles-and-permissions-list__table__item__role"
				size="3"
				weight="medium">
				{role}
			</Text>
			<Flex
				gap="3"
				className="user-roles-and-permissions-list__table__item__permissions">
				{permissions?.map((permission, index) => (
					<Badge
						key={index + permission}
						variant="soft"
						className="user-roles-and-permissions-list__table__item__permissions__badge"
						size="2"
						radius="full">
						{permission}
					</Badge>
				))}
			</Flex>

			<ChevronRightIcon
				height={20}
				width={20}
			/>
		</Flex>
	);
};

const ROLES_AND_PERMISSIONS = [
	{
		role: "John Smith",
		permissions: ["Read", "Write"],
		id: "1",
	},
	{
		role: "Admin Role",
		permissions: ["Read", "Write", "Delete"],
		id: "2",
	},
	{
		role: "Editor Role",
		permissions: ["Read", "Write"],
		id: "3",
	},
	{
		role: "Viewer Role",
		permissions: ["Read"],
		id: "4",
	},
	{
		role: "Manager Role",
		permissions: ["Read", "Write", "Approve"],
		id: "5",
	},
];

const UserRolesAndPermissionsTable = ({
	rolesAndPermissions,
	isFeatureEnabled,
}: {
	rolesAndPermissions: RoleWithOrWithoutPermissions[];
	isFeatureEnabled: boolean;
}) => {
	const isEmpty = rolesAndPermissions.length === 0;
	const isFeatureDisabled = !isFeatureEnabled;

	return (
		<Box className="user-roles-and-permissions-list__table">
			<Flex
				align="center"
				className="user-roles-and-permissions-list__table__header">
				<Text
					size="2"
					weight="medium"
					className="user-roles-and-permissions-list__table__header__roles">
					User Roles
				</Text>
				<Text
					size="2"
					weight="medium"
					className="user-roles-and-permissions-list__table__header__permissions">
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
								more details.
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
					ROLES_AND_PERMISSIONS.map(({ role, permissions }, index) => (
						<UserRolesAndPermissionsItem
							key={role}
							role={role}
							permissions={permissions}
							isLast={index === rolesAndPermissions.length - 1}
						/>
					))
				)}
			</Flex>
		</Box>
	);
};

function UserRolesAndPermissions() {
	const [pageState, setPageState] = useState<"LOADING" | "ERROR" | "SUCCESS">("LOADING");
	//	boolean to check whether the roles and permissions recipe is enabled or not.
	const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean | null>(null);

	const { getRoles } = useRolesService();
	const { showToast } = useContext(PopupContentContext);

	// used to store roles with permissions data that are fetched on the client side.
	const [roles, setRoles] = useState<RoleWithOrWithoutPermissions[]>([]);

	//	used to track active page user is on.
	const [currentActivePage, setCurrentActivePage] = useState(1);

	//	pagination related.
	const totalRolesCount = roles.length;
	const totalPages = Math.ceil(totalRolesCount / USER_ROLES_PAGINATION_LIMIT);
	const fetchRoles = async () => {
		try {
			const response = await getRoles();

			if (response !== undefined) {
				if (response.status === "OK") {
					//	reversing roles response to show latest roles first.
					const rolesWithUndefinedPermissions = response.roles.reverse().map((role) => {
						return {
							role,
							//	by default every role has permissions as undefined.
							permissions: undefined,
						};
					});
					setIsFeatureEnabled(true);
					setRoles(rolesWithUndefinedPermissions);
				}

				if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
					setIsFeatureEnabled(false);
				}
			} else {
				setPageState("ERROR");
			}
		} catch (_) {
			setPageState("ERROR");
		}
	};

	const onPageLoad = async () => {
		setPageState("LOADING");
		try {
			await fetchRoles();
			setPageState("SUCCESS");
		} catch (error) {
			setPageState("ERROR");
		}
	};

	useEffect(() => {
		void onPageLoad();
	}, []);

	return (
		<PageContainer>
			<PageHeading
				heading="Roles and Permissions"
				subtitle="One place to manage all your user roles and permissions. Edit roles and permissions according to your needs."
			/>
			<div className="user-roles-and-permissions-list">
				{(() => {
					switch (pageState) {
						case "LOADING":
							return <Loader type="list" />;
						case "ERROR":
							return <DashboardError />;
						case "SUCCESS":
							return (
								<Paper>
									<UserRolesAndPermissionsHeader />
									<UserRolesAndPermissionsTable
										rolesAndPermissions={roles}
										isFeatureEnabled={!!isFeatureEnabled}
									/>
									<UserRolesAndPermissionsFooter />
								</Paper>
							);

						default:
							assertNever(pageState);
					}
				})()}
			</div>
		</PageContainer>
	);
}

export default function UserViewRouter() {
	const [searchParams] = useSearchParams();
	const roleId = searchParams.get("roleid");

	if (roleId) {
		return <RoleDetails roleId={roleId} />;
	}
	return <UserRolesAndPermissions />;
}
