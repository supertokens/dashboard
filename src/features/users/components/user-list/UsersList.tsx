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

import { useCallback, useEffect, useMemo, useState } from "react";
import { getConnectionUri } from "@utils";

// Components
import { UserListFooter } from "./UserListFooter";
import { UserListTable } from "./UserListTable";
import { DemoCallout } from "@shared/components/demo-callout";
import { UserListHeader } from "./UserListHeader";
import PageContainer from "@shared/components/pageContainer";
import PageHeading from "@shared/components/pageHeading";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import Paper from "@shared/components/paper";

// Hooks
import { useUsersList } from "@features/users/hooks/useUsers";
import { useAnalytics } from "@features/analytics/hooks/useAnalytics";
import { useTenants } from "@features/tenants/hooks/useTenants";

import { UserSearchCriteria } from "@features/users/types/queries";
import { assertNever } from "@utils/assertNever";

export function UsersList() {
	const [searchCriteria, setSearchCriteria] = useState<UserSearchCriteria | null>(null);

	const { selectedTenant } = useTenants();

	const {
		users,
		totalCount,
		isLoading,
		error,
		isSearchActive,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		refetch: refetchUsers,
	} = useUsersList({
		tenantId: selectedTenant,
		searchCriteria,
	});

	const { fireOneTimeEvent } = useAnalytics();
	const connectionURI = useMemo(() => getConnectionUri(), []);

	useEffect(() => {
		void fireOneTimeEvent(selectedTenant);
	}, [fireOneTimeEvent, selectedTenant]);

	const handleLoadMore = useCallback(async () => {
		if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
			await fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleOffsetChange = useCallback(async () => {
		await refetchUsers();
	}, [refetchUsers]);

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
									/>

									<UserListTable
										users={[...users]}
										isSearch={isSearchActive}
									/>

									<UserListFooter
										count={totalCount}
										offset={0}
										limit={users.length}
										users={[...users]}
										offsetChange={handleOffsetChange}
										goToNext={handleLoadMore}
										nextPaginationToken={hasNextPage ? "has-more" : undefined}
										isSearch={isSearchActive}
									/>
								</Paper>
							);
						default:
							assertNever(viewState);
					}
				})()}
			</div>
		</PageContainer>
	);
}

export default UsersList;
