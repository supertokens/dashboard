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

import Button from "@components/radix/button";
import ItemContainer from "@components/radix/itemContainer";
import { TrashIcon } from "@radix-ui/react-icons";
import { Box, Flex, Text } from "@radix-ui/themes";
import { useState } from "react";
import DeleteUserModal from "@components/radix/modals/deleteUser";
import TabSelector from "@components/radix/tabSelector";
import { assertNever } from "@utils/assertNever";
import { useNavigate } from "react-router-dom";
import PageContainer from "@components/radix/pageContainer";
import ItemDetailHeader from "@components/radix/itemDetailsHeading";
import DashboardError from "@components/radix/error";
import Loader from "@components/radix/loader";
import Permissions from "./permissions";
import ManageAccess from "./manageAccess";

type RoleDetailTab = "permissions" | "manage-access";
const roleDetailTabs: { name: string; value: RoleDetailTab }[] = [
	{
		name: "Permissions",
		value: "permissions",
	},
	{
		name: "Manage Access",
		value: "manage-access",
	},
];

const RoleDetailContent = () => {
	const [selectedTab, setSelectedTab] = useState<RoleDetailTab>("manage-access");
	const [openDeleteUserModal, setOpenDeleteUserModal] = useState(false);
	const handleTabChange = (tab: RoleDetailTab) => {
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
					<Text
						size="5"
						weight="bold">
						Admin
					</Text>
					<Button
						color="red"
						size="2"
						variant="soft"
						onClick={() => {
							setOpenDeleteUserModal(true);
						}}>
						<TrashIcon />
						Delete Role
					</Button>
					<DeleteUserModal
						open={openDeleteUserModal}
						handleClose={() => {
							setOpenDeleteUserModal(false);
						}}
					/>
				</Flex>
			</ItemContainer>

			<ItemContainer>
				<TabSelector
					tabs={roleDetailTabs}
					onTabChange={(tab) => handleTabChange(tab as RoleDetailTab)}
					selectedTab={selectedTab}>
					{(() => {
						switch (selectedTab) {
							case "permissions":
								return <Permissions />;
							case "manage-access":
								return <ManageAccess />;
							default:
								return assertNever(selectedTab);
						}
					})()}
				</TabSelector>
			</ItemContainer>
		</Box>
	);
};

export default function RoleDetails({ roleId }: { roleId: string }) {
	const [state, setState] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");
	const navigate = useNavigate();

	const handleBackToItemList = () => {
		navigate("/roles");
	};

	return (
		<PageContainer>
			<Flex
				gap="4"
				direction="column">
				<ItemDetailHeader
					handleBackToItemList={handleBackToItemList}
					backToTitle="Back to Roles and Permissions"
					breadcrumbParent="Roles and Permissions"
					breadcrumbChild="Role Details"
				/>

				{(() => {
					switch (state) {
						case "ERROR":
							return <DashboardError />;
						case "SUCCESS":
							return <RoleDetailContent />;

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
