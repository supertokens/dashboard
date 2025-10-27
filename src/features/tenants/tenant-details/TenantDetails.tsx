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

import { useMemo, useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { EyeOpenIcon, TrashIcon } from "@radix-ui/react-icons";

import { assertNever } from "@shared/utils/assertNever";
import { PUBLIC_TENANT_ID } from "@shared/constants";
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
import EmptyList from "@shared/components/empty";
import Paper from "@shared/components/paper";

import { useTenantDetails } from "@features/tenants/hooks/useTenantDetails";
import DeleteTenantModal from "@features/tenants/modals/DeleteTenantModal";
import { LoginMethods } from "./LoginMethods";
import { SecondaryFactors } from "./SecondaryFactors";
import CoreConfiguration from "./core-configuration/CoreConfiguration";
import { Providers } from "./Providers";
import { useNavigationHelpers } from "@shared/navigation";
import { withOverride } from "@plugins";

import styles from "./TenantDetails.module.scss";
import { useToast } from "@components/toast";

type TenantDetailTab = "login-methods" | "secondary-factors" | "providers" | "core-configuration";

const tenantDetailTabs: { name: string; value: TenantDetailTab }[] = [
	{
		name: "Login Methods",
		value: "login-methods",
	},
	{
		name: "Secondary Factors",
		value: "secondary-factors",
	},
	{
		name: "Providers",
		value: "providers",
	},
	{
		name: "Core Configuration",
		value: "core-configuration",
	},
];

export const TenantDetailContent = withOverride(
	"TenantDetailContent",
	function TenantDetailContent({
	tenantId,
	tenantInfo,
	onDeleteTenant,
	isDeletingTenant,
}: {
	tenantId: string;
	tenantInfo: NonNullable<ReturnType<typeof useTenantDetails>["tenantInfo"]>;
	onDeleteTenant: () => Promise<void>;
	isDeletingTenant: boolean;
}) {
	const [deleteTenantModalOpen, setDeleteTenantModalOpen] = useState(false);
	const [selectedTab, setSelectedTab] = useState<TenantDetailTab>("login-methods");
	const { goToTenantsList, goToUsersList } = useNavigationHelpers();
	const { showErrorToast } = useToast();

	const handleTabChange = (tab: TenantDetailTab) => {
		setSelectedTab(tab);
	};

	const handleDeleteTenant = async () => {
		try {
			await onDeleteTenant();
			goToTenantsList();
		} catch (err) {
			showErrorToast("Failed to delete tenant");
		}
	};

	const canDeleteTenant = tenantId !== PUBLIC_TENANT_ID;

	return (
		<Box width={"100%"}>
			<ItemContainer
				mb="4"
				p="0">
				<Flex
					align="center"
					justify="between"
					p="4"
					className={styles["tenant-detail__header"]}>
					<Text
						size="5"
						weight="bold"
						className={styles["tenant-detail__header__name"]}>
						{tenantInfo.tenantId}
					</Text>
					{canDeleteTenant && (
						<Button
							color="red"
							size="2"
							variant="soft"
							onClick={() => setDeleteTenantModalOpen(true)}
							disabled={isDeletingTenant}>
							<TrashIcon />
							Delete Tenant
						</Button>
					)}
				</Flex>
				<Separator fullWidth />
				<Flex
					className={styles["tenant-detail__header__secondary"]}
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
						onClick={() => goToUsersList()}>
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
						case "secondary-factors":
							return <SecondaryFactors tenantInfo={tenantInfo} />;
						case "providers":
							return (
								<Providers
									tenantId={tenantId}
									tenantInfo={tenantInfo}
								/>
							);
						case "core-configuration":
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

			{canDeleteTenant && (
				<DeleteTenantModal
					open={deleteTenantModalOpen}
					handleClose={() => setDeleteTenantModalOpen(false)}
					tenantId={tenantId}
					onDeleteTenant={handleDeleteTenant}
					isDeleting={isDeletingTenant}
				/>
			)}
		</Box>
	);
});

const TenantDetails = withOverride("TenantDetails", function TenantDetails({ tenantId }: { tenantId: string }) {
	const { goToTenantsList } = useNavigationHelpers();
	const { tenantInfo, isLoading, error, deleteTenant, isDeletingTenant } = useTenantDetails(tenantId);
	const handleBackToItemList = () => {
		goToTenantsList();
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
							if (error?.message === "Tenant not found") {
								return (
									<Paper withBackground>
										<EmptyList
											iconUrl="tenant.svg"
											title="Tenant not found"
											description="We couldn't locate this tenant in our system. They may have been deleted or the tenant ID might be incorrect."
										/>
									</Paper>
								);
							}
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
							return assertNever(pageState);
					}
				})()}
			</Flex>
		</PageContainer>
	);
});

export default TenantDetails;
