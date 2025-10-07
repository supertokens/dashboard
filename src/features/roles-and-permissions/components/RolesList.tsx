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

import Paper from "@shared/components/paper";
import DashboardError from "@shared/components/error";
import PageContainer from "@shared/components/pageContainer";
import PageHeading from "@shared/components/pageHeading";
import Loader from "@shared/components/loader";
import { assertNever } from "@shared/utils/assertNever";
import { useToast } from "@shared/components/toast";

import CreateNewRoleModal from "../modals/CreateNewRoleModal";
import RolesListHeader from "./RolesListHeader";
import RolesListFooter from "./RolesListFooter";
import RolesListTable from "./RolesListTable";
import { useRolesList } from "../hooks";
import { ROLES_PAGINATION_LIMIT } from "../constants";

export default function RolesList() {
	const { showErrorToast, showSuccessToast } = useToast();
	const { roles, isFeatureEnabled, isLoading, error, refetch, createRole, searchQuery, setSearchQuery } =
		useRolesList();

	const [addNewRoleModalOpen, setAddNewRoleModalOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	const paginatedRoles = useMemo(() => {
		const startIndex = (currentPage - 1) * ROLES_PAGINATION_LIMIT;
		const endIndex = startIndex + ROLES_PAGINATION_LIMIT;
		return roles.slice(startIndex, endIndex);
	}, [roles, currentPage]);

	const totalPages = Math.ceil(roles.length / ROLES_PAGINATION_LIMIT);

	const handleCreateRole = async (roleName: string, permissions: string[]) => {
		try {
			const response = await createRole({ role: roleName, permissions });

			if (!response) {
				throw new Error("Failed to create role");
			}

			if (response.status === "OK") {
				showSuccessToast("Success", "Role created successfully!");
				setAddNewRoleModalOpen(false);
				await refetch();
			} else if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
				showErrorToast("Error", "Feature is not enabled");
			} else {
				throw new Error("Failed to create role");
			}
		} catch {
			showErrorToast("Error", "Something went wrong. Please try again!");
		}
	};

	const pageState = useMemo(() => {
		if (isLoading) return "LOADING";
		if (error) return "ERROR";
		return "SUCCESS";
	}, [isLoading, error]);

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
									<RolesListHeader
										isLoading={isLoading}
										searchQuery={searchQuery}
										onSearchChange={setSearchQuery}
										onAddRoleClick={() => setAddNewRoleModalOpen(true)}
									/>
									<RolesListTable
										roles={paginatedRoles}
										isFeatureEnabled={!!isFeatureEnabled}
									/>
									{isFeatureEnabled && roles.length > 0 && (
										<RolesListFooter
											currentPage={currentPage}
											totalPages={totalPages}
											totalCount={roles.length}
											pageSize={ROLES_PAGINATION_LIMIT}
											hasNextPage={currentPage < totalPages}
											hasPreviousPage={currentPage > 1}
											onNextPage={() => setCurrentPage((prev) => prev + 1)}
											onPreviousPage={() => setCurrentPage((prev) => prev - 1)}
										/>
									)}
								</Paper>
							);

						default:
							return assertNever(pageState);
					}
				})()}
			</div>
			<CreateNewRoleModal
				handleClose={() => setAddNewRoleModalOpen(false)}
				open={addNewRoleModalOpen}
				onCreateRole={handleCreateRole}
			/>
		</PageContainer>
	);
}
