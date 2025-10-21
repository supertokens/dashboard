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

import { useEffect, useMemo, useState } from "react";

import type { UserSearchCriteria } from "@features/users/hooks/useUsers";

import { useUsersList } from "@features/users/hooks/useUsers";
import { useAnalytics } from "@features/analytics/hooks/useAnalytics";
import { useTenants } from "@features/tenants/hooks/useTenants";

import { UserListFooter } from "./UserListFooter";
import { UserListTable } from "./UserListTable";
import { UserListHeader } from "./UserListHeader";
import { DemoCallout } from "@shared/components/demo-callout";
import PageContainer from "@shared/components/pageContainer";
import PageHeading from "@shared/components/pageHeading";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import Paper from "@shared/components/paper";

import { getConnectionUri } from "@shared/utils";
import { assertNever } from "@shared/utils/assertNever";
import { CreateUserModal } from "../create-user/CreateUserModal";

export function UsersList() {
	const [searchCriteria, setSearchCriteria] = useState<UserSearchCriteria | null>(null);
	const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

	const { selectedTenant } = useTenants();

	const {
		users,
		totalCount,
		isLoading,
		error,
		isSearchActive,
		currentPage,
		pageSize,
		hasNextPage,
		hasPreviousPage,
		isFetchingNextPage,
		goToNextPage,
		goToPreviousPage,
	} = useUsersList({
		tenantId: selectedTenant,
		searchCriteria,
	});

	const { fireOneTimeEvent } = useAnalytics();
	const connectionURI = useMemo(() => getConnectionUri(), []);

	useEffect(() => {
		void fireOneTimeEvent(selectedTenant);
	}, [fireOneTimeEvent, selectedTenant]);

	const viewState = useMemo(() => {
		if (error) return "ERROR";
		if (isLoading && users.length === 0) return "LOADING";
		return "SUCCESS";
	}, [error, isLoading, users.length]);

	return (
		<PageContainer>
			<PageHeading
				heading="User Management"
				subtitle="One place to manage all your users, revoke access and edit information according to your needs."
			/>
			<div className="users-list">
				<DemoCallout connectionURI={connectionURI} />
				{(() => {
					switch (viewState) {
						case "LOADING":
							return <Loader type="table-with-list" />;
						case "ERROR":
							return <DashboardError />;
						case "SUCCESS":
							return (
								<Paper>
									<UserListHeader
										onSearch={setSearchCriteria}
										currentSearchCriteria={searchCriteria}
										onCreateUserButtonClick={() => setIsCreateUserModalOpen(true)}
									/>

									<UserListTable
										users={[...users]}
										isSearch={isSearchActive}
									/>

									<UserListFooter
										count={totalCount}
										users={[...users]}
										currentPage={currentPage}
										pageSize={pageSize}
										goToPrevious={goToPreviousPage}
										goToNext={goToNextPage}
										hasPreviousPage={hasPreviousPage}
										hasNextPage={hasNextPage}
										isFetchingNextPage={isFetchingNextPage}
										isSearch={isSearchActive}
									/>
								</Paper>
							);
						default:
							assertNever(viewState);
					}
				})()}
				{isCreateUserModalOpen && <CreateUserModal handleClose={() => setIsCreateUserModalOpen(false)} />}
			</div>
		</PageContainer>
	);
}

export default UsersList;
