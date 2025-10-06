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

import { useContext, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Text } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";
import ItemContainer from "@shared/components/itemContainer";
import TabSelector from "@shared/components/tabSelector";
import PageContainer from "@shared/components/pageContainer";
import ItemDetailHeader from "@shared/components/itemDetailsHeading";
import DashboardError from "@shared/components/error";
import Loader from "@shared/components/loader";
import { PopupContentContext } from "@contexts/PopupContentContext";
import { assertNever } from "@utils/assertNever";
import { getImageUrl } from "@utils/index";

import Permissions from "./Permissions";
import ManageAccess from "./ManageAccess";
import DeleteRoleModal from "../modals/DeleteRoleModal";
import { useRoleDetails } from "../hooks";

type RoleDetailTab = "permissions" | "manage-access";

const roleDetailTabs: Array<{ name: string; value: RoleDetailTab }> = [
	{
		name: "Permissions",
		value: "permissions",
	},
	{
		name: "Manage Access",
		value: "manage-access",
	},
];

interface RoleDetailContentProps {
	roleId: string;
	onDeleteSuccess: () => void;
}

const RoleDetailContent = ({ roleId, onDeleteSuccess }: RoleDetailContentProps) => {
	const [selectedTab, setSelectedTab] = useState<RoleDetailTab>("manage-access");
	const [openDeleteRoleModal, setOpenDeleteRoleModal] = useState(false);

	const handleTabChange = (tab: RoleDetailTab) => {
		setSelectedTab(tab);
	};

	return (
		<Box width="100%">
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
						{roleId}
					</Text>
					<Button
						color="red"
						size="2"
						variant="soft"
						onClick={() => {
							setOpenDeleteRoleModal(true);
						}}>
						<TrashIcon />
						Delete Role
					</Button>
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
								return <Permissions roleId={roleId} />;
							case "manage-access":
								return <ManageAccess roleId={roleId} />;
							default:
								return assertNever(selectedTab);
						}
					})()}
				</TabSelector>
			</ItemContainer>

			<DeleteRoleModal
				open={openDeleteRoleModal}
				handleClose={() => setOpenDeleteRoleModal(false)}
				roleId={roleId}
				onDeleteSuccess={onDeleteSuccess}
			/>
		</Box>
	);
};

export default function RoleDetails({ roleId }: { roleId: string }) {
	const navigate = useNavigate();
	const { showToast } = useContext(PopupContentContext);
	const { isLoading, error } = useRoleDetails(roleId);

	const pageState = useMemo(() => {
		if (isLoading) return "LOADING";
		if (error) return "ERROR";
		return "SUCCESS";
	}, [isLoading, error]);

	const handleBackToItemList = () => {
		navigate("/roles");
	};

	const handleDeleteSuccess = () => {
		showToast({
			iconImage: getImageUrl("checkmark-green.svg"),
			toastType: "success",
			children: <>Role deleted successfully!</>,
		});
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
					switch (pageState) {
						case "ERROR":
							return <DashboardError />;
						case "SUCCESS":
							return (
								<RoleDetailContent
									roleId={roleId}
									onDeleteSuccess={handleDeleteSuccess}
								/>
							);

						case "LOADING":
							return <Loader type="table-with-list" />;
						default:
							return assertNever(pageState);
					}
				})()}
			</Flex>
		</PageContainer>
	);
}
