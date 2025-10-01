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

import { getConnectionUri } from "@utils";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";

import { useAnalyticsService } from "@api/analytics";
import useFetchSearchTags from "@api/search/searchTags";
import { useListTenantsService } from "@api/tenants";
import useFetchUsersService from "@api/users";
import useFetchCount from "@api/users/count";
import { LIST_DEFAULT_LIMIT } from "@components/usersListTable/UsersListTable";
import { StorageKeys } from "@constants";
import { useTenantsListContext } from "@contexts/TenantsListContext";
import { localStorageHandler } from "@services/storage";
import { getAuthMode } from "@utils";
import { assertNever } from "@utils/assertNever";
import { package_version } from "@version";

import { UserListFooter } from "./UserListFooter";
import { UserListTable } from "./UserListTable";
import { User } from "@features/users/types";
import { DemoCallout } from "@shared/components/demo-callout";
import { UserListHeader } from "./UserListHeader";
import PageContainer from "@shared/components/pageContainer";
import PageHeading from "@shared/components/pageHeading";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import Paper from "@shared/components/paper";

type NextPaginationTokenByOffset = Record<number, string | undefined>;
type UserListPropsReloadRef = MutableRefObject<(() => Promise<void>) | undefined>;

let isAnalyticsFired = false;
const limit = LIST_DEFAULT_LIMIT;

export function UsersList() {
	const [pageState, setPageState] = useState<"LOADING" | "ERROR" | "SUCCESS">("LOADING");
	const [count, setCount] = useState<number>();
	const [users, setUsers] = useState<User[]>([]);
	const [offset, setOffset] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [errorOffsets, setErrorOffsets] = useState<number[]>([]);
	const [isSearch, setIsSearch] = useState<boolean>(false);
	const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
	const [paginationTokenByOffset, setPaginationTokenByOffset] = useState<NextPaginationTokenByOffset>({});
	const [availableTags, setAvailableTags] = useState<string[]>([]);

	const { fetchSearchTags } = useFetchSearchTags();
	const { fetchUsers } = useFetchUsersService();
	const { fetchCount } = useFetchCount();
	const { fetchTenants } = useListTenantsService();
	const { fireEvent } = useAnalyticsService();

	const { setTenantsListToStore, tenantsListFromStore, getSelectedTenant, setSelectedTenant } =
		useTenantsListContext();
	const selectedTenant = getSelectedTenant();
	const reloadRef: UserListPropsReloadRef = useRef();

	const connectionURI = getConnectionUri();

	const fetchAndSetAvailableTags = async () => {
		try {
			const resp = await fetchSearchTags();
			setAvailableTags(resp?.tags ?? []);
		} catch (error) {
			// TODO: gracefully handle error
		}
	};

	const insertUsersAtOffset = useCallback(
		(paramUsers: User[], paramOffset?: number, isSearch?: boolean) => {
			if (isSearch) {
				return [...paramUsers];
			}
			if (paramOffset === undefined) {
				return [...users, ...paramUsers];
			}
			return [...users.slice(0, paramOffset), ...paramUsers, ...users.slice(paramOffset + limit)];
		},
		[users, limit]
	);

	const getOffsetByPaginationToken = useCallback(
		(paginationToken?: string) => {
			if (paginationToken === undefined) {
				return 0;
			}
			const matchedPaginationTokenByOffsetPair = Object.entries(paginationTokenByOffset).find(
				([_, token]) => paginationToken === token
			);
			return matchedPaginationTokenByOffsetPair !== undefined
				? parseInt(matchedPaginationTokenByOffsetPair[0])
				: undefined;
		},
		[paginationTokenByOffset]
	);

	const loadUsers = useCallback(
		async (paginationToken?: string, search?: object) => {
			let localSearch = false;
			const paramOffset = getOffsetByPaginationToken(paginationToken) ?? offset;
			setLoading(true);
			const nextOffset = paramOffset + limit;
			let data;
			const tenantId = getSelectedTenant();
			if (paginationToken !== undefined) {
				data = await fetchUsers({ paginationToken }, undefined, tenantId).catch(() => undefined);
				setIsSearch(false);
			} else if (search === undefined || Object.keys(search).length === 0) {
				data = await fetchUsers(undefined, undefined, tenantId).catch(() => undefined);
				setIsSearch(false);
			} else {
				data = await fetchUsers({ limit: 1000 }, search, tenantId).catch(() => undefined);
				setIsSearch(true);
				localSearch = true;
			}
			if (data) {
				// store the users and pagination token
				const { users: responseUsers, nextPaginationToken } = data;
				if (localSearch) {
					setUsers(responseUsers);
				} else {
					setUsers(insertUsersAtOffset(responseUsers, paramOffset));
				}
				setPaginationTokenByOffset({ ...paginationTokenByOffset, [nextOffset]: nextPaginationToken });
				setErrorOffsets(errorOffsets.filter((item) => item !== nextOffset));
			} else {
				setErrorOffsets([paramOffset]);
			}
			setLoading(false);
			setOffset(paramOffset);
		},
		[offset, errorOffsets, limit, paginationTokenByOffset, insertUsersAtOffset, getOffsetByPaginationToken]
	);

	const fireAnalyticsEvent = async () => {
		if (isAnalyticsFired) {
			return;
		}

		isAnalyticsFired = true;

		try {
			let email: string | undefined = "apikey@example.com";

			if (getAuthMode() === "email-password") {
				email = localStorageHandler.getItem(StorageKeys.EMAIL);
			}

			await fireEvent({
				email,
				dashboardVersion: package_version,
			});
		} catch (_) {
			// ignored
		}
	};

	const fetchAndSetCurrentTenant = async () => {
		const result = await fetchTenants();
		if (!result || !Array.isArray(result?.tenants) || result.tenants.length === 0) {
			return;
		}

		setTenantsListToStore(result.tenants);

		const tenantInStorage = getSelectedTenant();
		let tenantIdToUse: string | undefined;

		if (tenantInStorage === undefined) {
			tenantIdToUse = result.tenants[0].tenantId;
			setSelectedTenant(tenantIdToUse);
		} else {
			const filteredTenants = result.tenants.filter((t) => t.tenantId === tenantInStorage);
			if (filteredTenants.length === 0) {
				tenantIdToUse = result.tenants[0].tenantId;
				setSelectedTenant(tenantIdToUse);
			} else {
				tenantIdToUse = filteredTenants[0].tenantId;
				setSelectedTenant(tenantIdToUse);
			}
		}
	};

	const loadCount = async () => {
		const tenantId = getSelectedTenant();
		const [countResult] = await Promise.all([fetchCount(tenantId).catch(() => undefined), loadUsers()]);
		if (countResult) {
			setCount(countResult.count);
		}
	};

	const loadOffset = useCallback(
		async (offset: number) => {
			await loadUsers(paginationTokenByOffset[offset]);
		},
		[paginationTokenByOffset, loadUsers]
	);

	const onMount = async () => {
		try {
			setPageState("LOADING");
			await fetchAndSetCurrentTenant();
			await loadCount();
			await fireAnalyticsEvent();
			setPageState("SUCCESS");
		} catch (error) {
			setPageState("ERROR");
		}
	};

	useEffect(() => {
		void onMount();
	}, []);

	useEffect(() => {
		if (reloadRef !== undefined) {
			reloadRef.current = () => loadOffset(offset);
		}
	}, [reloadRef, loadOffset, offset]);

	const onEmailChanged = async () => {
		await loadOffset(offset);
	};

	return (
		<PageContainer>
			<PageHeading
				heading="User Management"
				subtitle="One place to manage all your users, revoke access and edit information according to your needs."
			/>
			<div className="users-list">
				<DemoCallout connectionURI={connectionURI} />
				{(() => {
					switch (pageState) {
						case "LOADING":
							return <Loader type="table-with-list" />;
						case "ERROR":
							return <DashboardError />;
						case "SUCCESS":
							return (
								<Paper>
									<UserListHeader
										onTenantChange={() => void loadCount()}
										loadCount={loadCount}
									/>
									<UserListTable users={users} />
									<UserListFooter
										count={(isSearch ? users.length : count) ?? 0}
										offset={offset}
										limit={isSearch ? users.length : limit}
										users={users}
										offsetChange={loadOffset}
										goToNext={loadUsers}
										nextPaginationToken={paginationTokenByOffset[offset + limit]}
										isSearch={isSearch}
									/>
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
