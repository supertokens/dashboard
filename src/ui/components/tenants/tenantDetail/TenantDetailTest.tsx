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

import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Flex, Text } from "@radix-ui/themes";
import { EyeOpenIcon, TrashIcon } from "@radix-ui/react-icons";

import { assertNever } from "@utils/assertNever";
import Button from "@shared/components/button";
import ItemDetailHeader from "@shared/components/itemDetailsHeading";
import PageContainer from "@shared/components/pageContainer";
import DashboardError from "@shared/components/error";
import Loader from "@shared/components/loader";
import TabSelector from "@shared/components/tabSelector";
import ItemContainer from "@shared/components/itemContainer";
import Separator from "@shared/components/separator";
import ItemLabel from "@shared/components/itemLabel";
import Crystal from "@shared/components/crystal";

import { useTenantDetails } from "@features/tenants/hooks/useTenantDetails";
import DeleteTenantModal from "@features/tenants/modals/DeleteTenantModal";
import { LoginMethods } from "./LoginMethods";
import { SecondaryFactors } from "./secondaryFactors";
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

const TenantDetailContent = ({
	tenantId,
	tenantInfo,
	onDeleteTenant,
	isDeletingTenant,
}: {
	tenantId: string;
	tenantInfo: NonNullable<ReturnType<typeof useTenantDetails>["tenantInfo"]>;
	onDeleteTenant: () => Promise<void>;
	isDeletingTenant: boolean;
}) => {
	const [deleteTenantModalOpen, setDeleteTenantModalOpen] = useState(false);
	const [selectedTab, setSelectedTab] = useState<TenantDetailTab>("login-methods");
	const navigate = useNavigate();

	const handleTabChange = (tab: TenantDetailTab) => {
		setSelectedTab(tab);
	};

	const handleDeleteTenant = async () => {
		try {
			await onDeleteTenant();
			navigate("/tenants");
		} catch (err) {
			// Error handling
		}
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
						{tenantInfo.tenantId}
					</Text>
					<Button
						color="red"
						size="2"
						variant="soft"
						onClick={() => setDeleteTenantModalOpen(true)}
						disabled={isDeletingTenant}>
						<TrashIcon />
						Delete Tenant
					</Button>
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
						<Crystal>{tenantInfo.userCount}</Crystal>
					</Flex>
					<Button
						size="2"
						variant="ghost"
						onClick={() => navigate(`/users?tenantId=${tenantId}`)}>
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
							return <LoginMethods tenantInfo={tenantInfo} />;
						case "Secondary Factors":
							return <SecondaryFactors tenantInfo={tenantInfo} />;
						case "Providers":
							return (
								<Providers
									tenantId={tenantId}
									tenantInfo={tenantInfo}
								/>
							);
						case "Core Configuration":
							return (
								<CoreConfiguration
									tenantId={tenantId}
									coreConfig={tenantInfo.coreConfig}
								/>
							);
						default:
							return assertNever(selectedTab);
					}
				})()}
			</TabSelector>

			<DeleteTenantModal
				open={deleteTenantModalOpen}
				handleClose={() => setDeleteTenantModalOpen(false)}
				tenantId={tenantId}
				onDeleteTenant={handleDeleteTenant}
				isDeleting={isDeletingTenant}
			/>
		</Box>
	);
};

export default function TenantDetailTest() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const tenantId = searchParams.get("tenantid") || "";

	const { tenantInfo, isLoading, error, deleteTenant, isDeletingTenant } = useTenantDetails(tenantId);

	const handleBackToItemList = () => {
		navigate("/tenants");
	};

	const pageState = useMemo(() => {
		if (isLoading) return "LOADING";
		if (error) return "ERROR";
		if (!tenantInfo) return "ERROR";
		return "SUCCESS";
	}, [isLoading, error, tenantInfo]);

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
					switch (pageState) {
						case "ERROR":
							return <DashboardError />;
						case "SUCCESS":
							return tenantInfo ? (
								<TenantDetailContent
									tenantId={tenantId}
									tenantInfo={tenantInfo}
									onDeleteTenant={async () => {
										await deleteTenant();
									}}
									isDeletingTenant={isDeletingTenant}
								/>
							) : null;
						case "LOADING":
							return <Loader type="table-with-list" />;
						default:
							assertNever(pageState);
					}
				})()}
			</Flex>
		</PageContainer>
	);
}
