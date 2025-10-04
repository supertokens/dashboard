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

import Button from "@shared/components/button";
import ItemDetailHeader from "@shared/components/itemDetailsHeading";
import PageContainer from "@shared/components/pageContainer";
import { EyeOpenIcon, TrashIcon } from "@radix-ui/react-icons";
import { Box, Flex, Text } from "@radix-ui/themes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assertNever } from "@utils/assertNever";
import DashboardError from "@shared/components/error";
import Loader from "@shared/components/loader";

import TabSelector from "@shared/components/tabSelector";
import ItemContainer from "@shared/components/itemContainer";
import Separator from "@shared/components/separator";
import ItemLabel from "@shared/components/itemLabel";
import Crystal from "@shared/components/crystal";
import { LoginMethods } from "../../../../features/users/components/user-details/login-methods/loginMethods";
import { SecondaryFactors } from "./secondaryFactors";
import DeleteTenantModal from "@shared/components/modals/deleteTenant";
import CoreConfiguration from "./coreConfiguration";
import { Providers } from "./providers";

type TenantDetailTab = "login-methods" | "Secondary Factors" | "Providers" | "Core Configuration";
const tenantDetailTabs: { name: string; value: TenantDetailTab }[] = [
	{
		name: "Login Methods",
		value: "login-methods",
	},
	{
		name: "Secondary Factors",
		value: "Secondary Factors",
	},
	{
		name: "Providers",
		value: "Providers",
	},
	{
		name: "Core Configuration",
		value: "Core Configuration",
	},
];

const TenantDetailContent = () => {
	const [deleteTenantModalOpen, setDeleteTenantModalOpen] = useState(false);
	const [selectedTab, setSelectedTab] = useState<TenantDetailTab>("login-methods");
	const navigate = useNavigate();
	const handleTabChange = (tab: TenantDetailTab) => {
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
					p="4"
					className="tenant-detail__header">
					<Text
						size="5"
						weight="bold"
						className="tenant-detail__header__name">
						Tenant 1
					</Text>
					<Button
						color="red"
						size="2"
						variant="soft"
						onClick={() => setDeleteTenantModalOpen(true)}>
						<TrashIcon />
						Delete Tenant
					</Button>
					<DeleteTenantModal
						open={deleteTenantModalOpen}
						handleClose={() => setDeleteTenantModalOpen(false)}
					/>
				</Flex>
				<Separator fullWidth />
				<Flex
					className="tenant-detail__header__secondary"
					align="center"
					px="4"
					py="3"
					justify="between">
					<Flex align="center">
						<ItemLabel mr="2">Total Number of Users:</ItemLabel>
						<Crystal>102</Crystal>
					</Flex>
					<Button
						size="2"
						variant="ghost"
						onClick={() => navigate("/")}>
						<EyeOpenIcon />
						See Users
					</Button>
				</Flex>
			</ItemContainer>

			<TabSelector
				tabs={tenantDetailTabs}
				onTabChange={(tab) => handleTabChange(tab as TenantDetailTab)}
				selectedTab={selectedTab}>
				{(() => {
					switch (selectedTab) {
						case "login-methods":
							return <LoginMethods />;
						case "Secondary Factors":
							return <SecondaryFactors />;
						case "Providers":
							return <Providers />;
						case "Core Configuration":
							return <CoreConfiguration />;
						default:
							return assertNever(selectedTab);
					}
				})()}
			</TabSelector>
		</Box>
	);
};

export default function TenantDetailTest() {
	const navigate = useNavigate();
	const [state, setState] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");

	const handleBackToItemList = () => {
		navigate("/tenants");
	};

	return (
		<PageContainer>
			<Flex
				gap="4"
				direction="column">
				<ItemDetailHeader
					handleBackToItemList={handleBackToItemList}
					backToTitle="Back to Tenant Management"
					breadcrumbParent="Tenant Management"
					breadcrumbChild="Tenant Details"
				/>

				{(() => {
					switch (state) {
						case "ERROR":
							return <DashboardError />;
						case "SUCCESS":
							return <TenantDetailContent />;
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
