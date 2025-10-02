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

import PageContainer from "@shared/components/pageContainer";
import PageHeading from "@shared/components/pageHeading";
import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import Paper from "@shared/components/paper";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import IconButton from "@shared/components/iconButton";
import Button from "@shared/components/button";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import { assertNever } from "@utils/assertNever";
import { isSearchEnabled } from "@utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tenant } from "@api/tenants/types";
import EmptyList from "@shared/components/empty";
import TenantDetailTest from "@components/tenants/tenantDetail/TenantDetailTest";

import "./indexTest.scss";
import Search from "@shared/components/search";

const TenantListHeader = () => {
	return (
		<Flex
			justify="between"
			gap="8"
			mb="4"
			className="tenants-list__header">
			<Flex
				flexGrow="1"
				gap="2">
				{isSearchEnabled() && (
					<Box className="tenants-list__header__search">
						<Search
							onSearch={() => {
								return Promise.resolve();
							}}
							placeholder="Search Tenant"
						/>
					</Box>
				)}
			</Flex>
			<Button
				size="2"
				variant="solid"
				className="tenants-list__header__btn">
				<PlusIcon />
				Add Tenant
			</Button>
		</Flex>
	);
};
const TenantListItem = ({ tenant }: { tenant: Tenant }) => {
	const navigate = useNavigate();
	return (
		<Flex
			align="center"
			width="100%"
			className={"tenants-list__table__item"}
			onClick={() => {
				navigate(`/tenants?tenantid=${tenant.tenantId}`);
			}}>
			<Text
				className="tenants-list__table__item__tenant-id"
				size="3"
				weight="medium">
				{tenant.tenantId}
			</Text>
			<Flex
				className="tenants-list__table__item__login-methods"
				gap="2"
				align="center">
				{tenant.firstFactors.map((factor) => (
					<Badge
						className="tenants-list__table__item__login-methods__badge"
						key={factor}
						size="1"
						variant="soft"
						radius="medium">
						<Text size="2">{factor}</Text>
					</Badge>
				))}
			</Flex>

			<ChevronRightIcon
				height={16}
				width={16}
			/>
		</Flex>
	);
};

const TenantListTable = () => {
	const tenants: Tenant[] = [
		{
			tenantId: "tenant-1",
			firstFactors: ["Email Password"],
		},
		{
			tenantId: "tenant-2",
			firstFactors: ["Email Password", "Passwordless", "Third Party"],
		},
		{
			tenantId: "tenant-3",
			firstFactors: ["Third Party"],
		},
	];

	return (
		<Box className="tenants-list__table">
			<Flex
				align="center"
				className="tenants-list__table__header">
				<Text
					size="2"
					weight="medium"
					className="tenants-list__table__header__tenant-id">
					User Roles
				</Text>
				<Text
					size="2"
					weight="medium"
					className="tenants-list__table__header__login-methods">
					Login Methods
				</Text>
			</Flex>
			{tenants.length === 0 ? (
				<EmptyList
					iconUrl="tenant.svg"
					title="There are no tenants created"
					description="Once added, all tenants will be found here"
				/>
			) : (
				<>
					<Flex direction="column">
						{tenants.map((tenant) => (
							<TenantListItem
								key={tenant.tenantId}
								tenant={tenant}
							/>
						))}
					</Flex>
				</>
			)}
		</Box>
	);
};

const TenantListFooter = () => {
	const isSearch = false;

	return (
		<Flex
			align="center"
			justify="end"
			gap="3"
			className="users-list__table__footer"
			mt="4">
			{/* We don't support pagination for search results for now */}
			{isSearch ? (
				<Text
					size="2"
					weight="medium">
					4 results
				</Text>
			) : (
				<>
					<Text
						size="2"
						weight="medium">
						0 - 10 of 50
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
				</>
			)}
		</Flex>
	);
};

function TenantsListPage() {
	const [pageState] = useState<"LOADING" | "ERROR" | "SUCCESS">("SUCCESS");
	return (
		<PageContainer>
			<PageHeading
				heading="Tenant Management"
				subtitle="One place to manage all your tenants. Create or edit tenants and their login methods according to your needs."
			/>
			<div className="tenants-list">
				{(() => {
					switch (pageState) {
						case "LOADING":
							return <Loader type="table-with-list" />;
						case "ERROR":
							return <DashboardError />;
						case "SUCCESS":
							return (
								<Paper>
									<TenantListHeader />
									<TenantListTable />
									<TenantListFooter />
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

export default function TenantViewRouter() {
	const [searchParams] = useSearchParams();
	const tenantId = searchParams.get("tenantid");

	if (tenantId) {
		return <TenantDetailTest />;
	}
	return <TenantsListPage />;
}
