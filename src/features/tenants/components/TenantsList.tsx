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
import { useNavigate } from "react-router-dom";

import { assertNever } from "@utils/assertNever";
import PageContainer from "@shared/components/pageContainer";
import PageHeading from "@shared/components/pageHeading";
import Paper from "@shared/components/paper";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";

import { useTenants } from "../hooks/useTenants";
import CreateNewTenantModal from "../modals/CreateNewTenantModal";
import TenantsListHeader from "./TenantsListHeader";
import TenantsListTable from "./TenantsListTable";
import TenantsListFooter from "./TenantsListFooter";

export default function TenantsList() {
	const navigate = useNavigate();
	const {
		tenants,
		isLoading,
		error,
		searchQuery,
		setSearchQuery,
		createTenant: createTenantMutation,
		isCreatingTenant,
	} = useTenants();

	const [currentPage, setCurrentPage] = useState(1);
	const [isCreateTenantModalOpen, setIsCreateTenantModalOpen] = useState(false);

	const pageState = useMemo(() => {
		if (isLoading) return "LOADING";
		if (error) return "ERROR";
		return "SUCCESS";
	}, [isLoading, error]);

	const handleCreateTenant = async (tenantId: string) => {
		const response = await createTenantMutation(tenantId);

		if (response.status === "OK") {
			navigate(`/tenants?tenantid=${tenantId.toLowerCase()}`);
		} else if (response.status === "MULTITENANCY_NOT_ENABLED_IN_CORE_ERROR") {
			throw new Error(
				"Multitenancy is a paid feature and is not available on your core instance. Please sign up to get a license key."
			);
		} else if (response.status === "TENANT_ID_ALREADY_EXISTS_ERROR") {
			throw new Error("Provided tenant id already exists.");
		} else if (response.status === "INVALID_TENANT_ID_ERROR") {
			throw new Error(response.message);
		}
	};

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
									<TenantsListHeader
										searchQuery={searchQuery}
										setSearchQuery={(query) => {
											setSearchQuery(query);
											setCurrentPage(1);
										}}
										onAddTenant={() => setIsCreateTenantModalOpen(true)}
										isLoading={false}
									/>
									<TenantsListTable
										tenants={tenants}
										currentPage={currentPage}
									/>
									<TenantsListFooter
										totalCount={tenants.length}
										currentPage={currentPage}
										setCurrentPage={setCurrentPage}
										isSearch={searchQuery.trim().length > 0}
									/>
								</Paper>
							);
						default:
							assertNever(pageState);
					}
				})()}
			</div>
			<CreateNewTenantModal
				open={isCreateTenantModalOpen}
				handleClose={() => {
					setIsCreateTenantModalOpen(false);
				}}
				onCreateTenant={handleCreateTenant}
				isCreating={isCreatingTenant}
			/>
		</PageContainer>
	);
}
