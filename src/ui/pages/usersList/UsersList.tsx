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

import React, { MutableRefObject, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetTenantsList } from "../../../api/tenants/list";
import useDeleteUserService from "../../../api/user/delete";
import useVerifyEmailService from "../../../api/user/email/verify";
import useVerifyUserTokenService from "../../../api/user/email/verify/token";
import useFetchUsersService from "../../../api/users";
import useFetchCount from "../../../api/users/count";
import { StorageKeys } from "../../../constants";
import { localStorageHandler } from "../../../services/storage";
import { AppEnvContextProvider, useAppEnvContext } from "../../../ui/contexts/AppEnvContext";
import { getApiUrl, getAuthMode, isSearchEnabled, useFetchData } from "../../../utils";
import { package_version } from "../../../version";
import { Footer, LOGO_ICON_LIGHT } from "../../components/footer/footer";
import InfoConnection from "../../components/info-connection/info-connection";
import NoUsers from "../../components/noUsers/NoUsers";
import Search from "../../components/search";
import UserDetail from "../../components/userDetail/userDetail";
import {
	getDeleteUserToast,
	getEmailUnVerifiedToast,
	getEmailVerifiedToast,
	getSendEmailVerificationToast,
} from "../../components/userDetail/userDetailForm";
import UsersListTable, {
	LIST_DEFAULT_LIMIT,
	OnSelectUserFunction,
	UserRowActionProps,
} from "../../components/usersListTable/UsersListTable";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import { useTenantsListContext } from "../../contexts/TenantsListContext";
import "./UsersList.scss";
import { EmailVerificationStatus, User } from "./types";

type UserListPropsReloadRef = MutableRefObject<(() => Promise<void>) | undefined>;

type UserListProps = {
	onSelect: OnSelectUserFunction;
	css?: React.CSSProperties;
	/**
	 * a callback that can be used to trigger reloading the current active page
	 */
	reloadRef?: UserListPropsReloadRef;
} & UserRowActionProps;

type NextPaginationTokenByOffset = Record<number, string | undefined>;

let isAnalyticsFired = false;

export const UsersList: React.FC<UserListProps> = ({
	onSelect,
	css,
	reloadRef,
	onChangePasswordCallback,
	onDeleteCallback,
}) => {
	const limit = LIST_DEFAULT_LIMIT;
	const [count, setCount] = useState<number>();
	const [users, setUsers] = useState<User[]>([]);
	const [offset, setOffset] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [errorOffsets, setErrorOffsets] = useState<number[]>([]);
	const [isSearch, setIsSearch] = useState<boolean>(false);
	const [paginationTokenByOffset, setPaginationTokenByOffset] = useState<NextPaginationTokenByOffset>({});
	const { fetchUsers } = useFetchUsersService();
	const { fetchCount } = useFetchCount();
	const { fetchTenants } = useGetTenantsList();
	const fetchData = useFetchData();
	const { setTenantsListToStore, tenantsListFromStore, getSelectedTenant, setSelectedTenant } =
		useTenantsListContext();
	const selectedTenant = getSelectedTenant();

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

			await fetchData({
				url: getApiUrl("/api/analytics"),
				method: "POST",
				config: {
					body: JSON.stringify({
						email,
						dashboardVersion: package_version,
					}),
				},
				// We dont want to trigger the error boundary if this API fails
				ignoreErrors: true,
			});
		} catch (_) {
			// ignored
		}
	};

	const fetchAndSetCurrentTenant = async () => {
		const result = await fetchTenants();

		setTenantsListToStore(result.tenants);

		if (result.tenants.length === 0) {
			return;
		}

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
		setLoading(true);
		const tenantId = getSelectedTenant();
		const [countResult] = await Promise.all([fetchCount(tenantId).catch(() => undefined), loadUsers()]);
		if (countResult) {
			setCount(countResult.count);
		}

		setLoading(false);
	};

	const loadOffset = useCallback(
		async (offset: number) => {
			await loadUsers(paginationTokenByOffset[offset]);
		},
		[paginationTokenByOffset, loadUsers]
	);

	const onMount = async () => {
		await fetchAndSetCurrentTenant();
		await loadCount();
		await fireAnalyticsEvent();
	};

	useEffect(() => {
		void onMount();
	}, []);

	useEffect(() => {
		if (reloadRef !== undefined) {
			reloadRef.current = () => loadOffset(offset);
		}
	}, [reloadRef, loadOffset, offset]);

	const { connectionURI } = useAppEnvContext();

	const onEmailChanged = async () => {
		await loadOffset(offset);
	};

	return (
		<div
			className="users-list"
			style={css}>
			<img
				className="title-image"
				src={LOGO_ICON_LIGHT}
				alt="Auth Page"
			/>
			<h1 className="users-list-title">
				User Management <span className="pill paid-feature-badge">Beta</span>
			</h1>
			<p className="text-small users-list-subtitle">
				One place to manage all your users, revoke access and edit information according to your needs.
			</p>

			{connectionURI && <InfoConnection connectionURI={connectionURI} />}

			{tenantsListFromStore !== undefined && tenantsListFromStore.length > 1 && (
				<div className="tenant-id-container">
					<span className="tenant-id-title">Tenant ID:</span>
					<select
						className="tenant-list-dropdown"
						defaultValue={selectedTenant}
						onChange={(event) => {
							setSelectedTenant(event.target.value);
							void loadCount();
						}}>
						{tenantsListFromStore.map((tenant) => {
							return (
								<option
									key={tenant.tenantId}
									value={tenant.tenantId}>
									{tenant.tenantId}
								</option>
							);
						})}
					</select>
				</div>
			)}

			{isSearchEnabled() && (
				<Search
					onSearch={loadUsers}
					loading={loading}
				/>
			)}

			<div className="users-list-paper">
				{users.length === 0 && !loading && !errorOffsets.includes(0) ? (
					<NoUsers isSearch={isSearch} />
				) : (
					<UsersListTable
						users={users}
						offset={offset}
						count={(isSearch ? users.length : count) ?? 0}
						errorOffsets={errorOffsets}
						limit={isSearch ? users.length : limit}
						nextPaginationToken={paginationTokenByOffset[offset + limit]}
						goToNext={(token) => loadUsers(token)}
						offsetChange={loadOffset}
						isLoading={loading}
						onSelect={onSelect}
						onChangePasswordCallback={onChangePasswordCallback}
						onDeleteCallback={onDeleteCallback}
						onEmailChanged={onEmailChanged}
						pagination={!isSearch}
					/>
				)}
			</div>
		</div>
	);
};

export const UserListPage = () => {
	const navigate = useNavigate();
	const currentLocation = useLocation();
	const [selectedUser, setSelectedUser] = useState<string>();
	const [selectedRecipeId, setSelectedRecipeId] = useState<string>();
	const [selectedUserEmailVerification, setSelectedUserEmailVerification] = useState<
		EmailVerificationStatus | undefined
	>();
	const isSelectedUserNotEmpty = selectedUser !== undefined;

	const reloadListRef: UserListPropsReloadRef = useRef();

	const { showToast } = useContext(PopupContentContext);

	const { updateUserEmailVerificationStatus } = useVerifyEmailService();
	const { deleteUser } = useDeleteUserService();
	const { sendUserEmailVerification: sendUserEmailVerificationApi } = useVerifyUserTokenService();

	const backToList = useCallback(() => {
		navigate(
			{
				pathname: currentLocation.pathname,
				search: "",
			},
			{
				replace: true,
			}
		);
		void reloadListRef.current?.();
		setSelectedUser(undefined);
	}, []);

	const onUserDelete = useCallback(
		async (userId: string) => {
			const deleteSucceed = await deleteUser(userId, true);
			const didSucceed = deleteSucceed !== undefined && deleteSucceed.status === "OK";
			if (didSucceed) {
				backToList();
			}
			showToast(getDeleteUserToast(didSucceed));
		},
		[backToList, showToast]
	);

	const changePassword = useCallback(
		async (userId: string, newPassword: string) => {
			// const response = await updatePassword(userId, newPassword);
			// showToast(getUpdatePasswordToast(respo));
		},
		[showToast]
	);

	const sendUserEmailVerification = useCallback(
		async (userId: string, tenantId: string | undefined) => {
			const isSend = await sendUserEmailVerificationApi(userId, tenantId);
			showToast(getSendEmailVerificationToast(isSend));
			return isSend;
		},
		[showToast]
	);

	const updateEmailVerificationStatus = useCallback(
		async (userId: string, isVerified: boolean, tenantId: string | undefined) => {
			const isUpdated = await updateUserEmailVerificationStatus(userId, isVerified, tenantId);
			if (isUpdated) {
				setSelectedUserEmailVerification({ isVerified, status: "OK" });
			}
			showToast(isVerified ? getEmailVerifiedToast(isUpdated) : getEmailUnVerifiedToast(isUpdated));
			return isUpdated;
		},
		[showToast]
	);

	useEffect(() => {
		if (selectedUser === undefined && currentLocation.search !== null && currentLocation.search !== "") {
			const urlParams = new URLSearchParams(currentLocation.search);
			const userid = urlParams.get("userid");

			if (userid !== null) {
				// This means that there is a userid in the URL, show details
				setSelectedUser(userid);
			}
		}
	}, []);

	const onUserSelected = (user: User) => {
		navigate(
			{
				pathname: currentLocation.pathname,
				search: `?userid=${user.id}`,
			},
			{
				replace: true,
			}
		);
		setSelectedUser(user.id);
	};

	return (
		<AppEnvContextProvider
			connectionURI={
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(window as any).connectionURI
			}>
			{isSelectedUserNotEmpty && (
				<UserDetail
					user={selectedUser}
					onBackButtonClicked={backToList}
					onDeleteCallback={({ id }) => onUserDelete(id)}
					onSendEmailVerificationCallback={({ id, tenantIds }) => {
						return sendUserEmailVerification(id, tenantIds.length > 0 ? tenantIds[0] : undefined);
					}}
					onUpdateEmailVerificationStatusCallback={(
						userId: string,
						isVerified: boolean,
						tenantId: string | undefined
					) => {
						return updateEmailVerificationStatus(userId, isVerified, tenantId);
					}}
					onChangePasswordCallback={changePassword}
				/>
			)}
			<UsersList
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				onSelect={onUserSelected}
				css={isSelectedUserNotEmpty ? { display: "none" } : undefined}
				reloadRef={reloadListRef}
				onChangePasswordCallback={changePassword}
				onDeleteCallback={({ id }) => onUserDelete(id)}
			/>
			<Footer
				colorMode="dark"
				horizontalAlignment="center"
				verticalAlignment="center"
			/>
		</AppEnvContextProvider>
	);
};

export default UserListPage;
