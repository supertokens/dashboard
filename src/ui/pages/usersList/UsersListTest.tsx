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

import PageContainer from "@components/radix/pageContainer";
import PageHeading from "@components/radix/pageHeading";
import Callout from "@components/radix/callout";
import { getConnectionUri, getImageUrl, isUsingDemoConnectionUri, isSearchEnabled } from "@utils";
import { Box, Flex, Select, Text } from "@radix-ui/themes";
import Paper from "@components/radix/paper";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import IconButton from "@components/radix/iconButton";
import Button from "@components/radix/button";

import Loader from "@components/radix/loader";
import DashboardError from "@components/radix/error";
import { assertNever } from "@utils/assertNever";
import { LIST_DEFAULT_LIMIT } from "@components/usersListTable/UsersListTable";
import { User } from "./types";
import useFetchUsersService from "@api/users";
import { useListTenantsService } from "@api/tenants";
import { useTenantsListContext } from "@contexts/TenantsListContext";
import useFetchCount from "@api/users/count";
import { getAuthMode } from "@utils";
import { localStorageHandler } from "@services/storage";
import { StorageKeys } from "@constants";
import { package_version } from "@version";
import { useAnalyticsService } from "@api/analytics";
import useFetchSearchTags from "@api/search/searchTags";
import Search from "@components/search/indexTest";

import "./UsersListTest.scss";
import EmptyList from "@components/radix/empty";
import CreateUserDialogTest from "@components/createUser/CreateUserDialogTest";
import { Tenant } from "@api/tenants/types";

const RenderDemoCallout = ({ connectionURI }: { connectionURI: string }) => {
	if (!isUsingDemoConnectionUri(connectionURI)) return null;
	return (
		<Callout
			size="1"
			mb="5"
			className="users-list__demo-callout">
			<Text
				size="2"
				weight="medium"
				className="users-list__demo-callout__text">
				connectionURI set to:{" "}
				<span className="users-list__demo-callout__text--highlighted">
					{" "}
					https://try.supertokens.com/appid-demo-dashboard{" "}
				</span>
				You are connected to an instance of SuperTokens core hosted for demo purposes, this instance should not
				be used for production apps.
			</Text>
		</Callout>
	);
};

const UserListHeader = ({ onTenantChange, loadCount }: { onTenantChange: () => void; loadCount: () => void }) => {
	const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
	const { getSelectedTenant, setSelectedTenant, tenantsListFromStore } = useTenantsListContext();
	const selectedTenant = getSelectedTenant();

	return (
		<Flex
			justify="between"
			gap="8"
			mb="4"
			className="users-list__header">
			<Flex
				flexGrow="1"
				gap="2"
				maxWidth="600px">
				{isSearchEnabled() && (
					<Box className="users-list__header__search">
						<Search
							onSearch={() => {
								return Promise.resolve();
							}}
							isLoading={false}
						/>
					</Box>
				)}

				<Select.Root
					size="2"
					value={selectedTenant}
					onValueChange={(value) => {
						setSelectedTenant(value);
						onTenantChange();
					}}>
					<Select.Trigger
						variant="surface"
						className="users-list__header__select">
						<Flex
							as="span"
							align="center"
							gap="2">
							<Text
								size="2"
								weight="regular"
								className="users-list__header__select__text--gray">
								Tenant ID:
							</Text>
							<Text
								size="2"
								weight="medium"
								className="users-list__header__select__text--solid">
								{selectedTenant}
							</Text>
						</Flex>
					</Select.Trigger>
					{tenantsListFromStore && (
						<Select.Content position="popper">
							{tenantsListFromStore.map((tenant) => (
								<Select.Item
									key={tenant.tenantId}
									value={tenant.tenantId}>
									{tenant.tenantId}
								</Select.Item>
							))}
						</Select.Content>
					)}
				</Select.Root>
				<IconButton
					size="2"
					variant="soft"
					color="gray">
					<img
						src={getImageUrl("filter-icon.svg")}
						alt="filter-icon"
					/>
				</IconButton>
			</Flex>
			<Button
				onClick={() => setShowCreateUserDialog(true)}
				size="2"
				variant="solid"
				className="users-list__header__btn">
				<PlusIcon />
				Add User
			</Button>
			{showCreateUserDialog && (
				<CreateUserDialogTest
					handleClose={() => setShowCreateUserDialog(false)}
					tenants={tenantsListFromStore ?? []}
					loadCount={loadCount}
				/>
			)}
		</Flex>
	);
};
const UserListItem = ({ user, isLast }: { user: User; isLast: boolean }) => {
	const { firstName, lastName, emails, timeJoined } = user;
	return (
		<Flex
			align="center"
			width="100%"
			className={`users-list__table__item ${isLast ? "users-list__table__item--last" : ""}`}>
			<Flex
				className="users-list__table__item__details"
				direction="column"
				gap="1">
				<Text
					className="users-list__table__item__details__name"
					size="3"
					weight="medium">
					{firstName + " " + lastName}
				</Text>
				<Text
					className="users-list__table__item__details__email"
					size="2"
					weight="medium">
					{emails[0]}
				</Text>
			</Flex>
			<Text
				className="users-list__table__item__time-joined"
				size="2"
				weight="medium">
				{timeJoined}
			</Text>
			<ChevronRightIcon
				height={20}
				width={20}
			/>
		</Flex>
	);
};

type UserListTableProps = {
	users: User[];
	offset: number;
	count: number;
	errorOffsets: number[];
	limit: number;
	nextPaginationToken: string | undefined;
	goToNext: (token: string) => void;
	offsetChange: (offset: number) => void;
	isLoading: boolean;
	// onSelect: (user: User) => void;
	// onChangePasswordCallback: (user: User) => void;
	// onDeleteCallback: (user: User) => void;
	// onEmailChanged: () => void;
	pagination: boolean;
};

const UserListTable = ({
	users,
	offset,
	count,
	errorOffsets,
	limit,
	nextPaginationToken,
	goToNext,
	offsetChange,
	isLoading,
	pagination,
}: UserListTableProps) => {
	const [sort, setSort] = useState<"asc" | "desc">("desc");

	return (
		<Box className="users-list__table">
			<Flex
				align="center"
				className="users-list__table__header">
				<Text
					size="2"
					weight="medium"
					className="users-list__table__header__user">
					Users
				</Text>
				<Text
					size="2"
					weight="medium"
					className="users-list__table__header__time-joined">
					Time Joined{" "}
					<img
						src={getImageUrl(sort === "asc" ? "sort-ascending.svg" : "sort-descending.svg")}
						alt="sort-ascending"
						onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
					/>
				</Text>
			</Flex>
			{users.length === 0 ? (
				<EmptyList
					iconUrl="user.svg"
					title="You don't have any users"
					description="Once added all users will be found here. If you are using the session management feature of SuperTokens, your users will not appear in this list."
				/>
			) : (
				<>
					<Flex direction="column">
						{users.map((user, index) => (
							<UserListItem
								key={user.emails[0]}
								isLast={index === users.length - 1}
								user={user}
							/>
						))}
					</Flex>
				</>
			)}
		</Box>
	);
};

const UserListFooter = () => {
	return (
		<Flex
			align="center"
			justify="end"
			gap="3"
			className="users-list__table__footer"
			mt="4">
			<Text
				size="2"
				weight="medium">
				1 - 10 of 54
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
		</Flex>
	);
};

type NextPaginationTokenByOffset = Record<number, string | undefined>;
type UserListPropsReloadRef = MutableRefObject<(() => Promise<void>) | undefined>;

let isAnalyticsFired = false;
const limit = LIST_DEFAULT_LIMIT;

export default function UsersListPage() {
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
				<RenderDemoCallout connectionURI={connectionURI} />
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
									<UserListTable
										users={users}
										offset={offset}
										count={(isSearch ? users.length : count) ?? 0}
										errorOffsets={errorOffsets}
										limit={isSearch ? users.length : limit}
										nextPaginationToken={paginationTokenByOffset[offset + limit]}
										goToNext={(token) => loadUsers(token)}
										offsetChange={loadOffset}
										isLoading={loading}
										pagination={!isSearch}
									/>
									<UserListFooter />
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
