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

import React, { useCallback, useEffect, useState } from "react";
import { fetchDataAndRedirectIf401, getApiUrl } from "../../../utils";
import AuthWrapper from "../../components/authWrapper";
import { Footer, LOGO_ICON_LIGHT } from "../../components/footer/footer";
import InfoConnection from "../../components/info-connection/info-connection";
import NoUsers from "../../components/noUsers/NoUsers";
import UserDetail from "../../components/userDetail/userDetail";
import UsersListTable, {
	LIST_DEFAULT_LIMIT,
	OnSelectUserFunction,
} from "../../components/usersListTable/UsersListTable";
import { UserListCount, UserPaginationList, UserWithRecipeId } from "./types";
import "./UsersList.scss";

type UserListProps = {
	onSelect: OnSelectUserFunction;
	css?: React.CSSProperties;
};

export const UsersList: React.FC<UserListProps> = ({ onSelect, css }) => {
	const limit = LIST_DEFAULT_LIMIT;
	const [count, setCount] = useState<number>();
	const [users, setUsers] = useState<UserWithRecipeId[]>([]);
	const [offset, setOffset] = useState<number>(0);
	const [nextPaginationToken, setNextPaginationToken] = useState<string>();
	const [loading, setLoading] = useState<boolean>(true);
	const [errorOffsets, setErrorOffsets] = useState<number[]>([]);
	const [connectionURI, setConnectionURI] = useState<string>();
	const loadUsers = useCallback(
		async (paginationToken?: string) => {
			setLoading(true);
			const nextOffset = offset + limit;
			const newOffset = paginationToken ? nextOffset : offset;
			if (!users || users[nextOffset] === undefined) {
				const data = await (paginationToken ? fetchUsers({ paginationToken }) : fetchUsers()).catch(
					() => undefined
				);
				if (data) {
					// store the users and pagination token
					const { users: responseUsers, nextPaginationToken } = data;
					setUsers(users.concat(responseUsers));
					setNextPaginationToken(nextPaginationToken);
					setErrorOffsets(errorOffsets.filter((item) => item !== nextOffset));
				} else {
					setErrorOffsets([newOffset]);
				}
				setLoading(false);
			}
			setOffset(newOffset);
		},
		[offset, users, errorOffsets, limit]
	);
	const loadCount = useCallback(async () => {
		setLoading(true);
		const [countResult] = await Promise.all([fetchCount().catch(() => undefined), loadUsers()]);
		if (countResult) {
			setCount(countResult.count);
		}
		setLoading(false);
	}, []);
	const loadOffset = useCallback((offset: number) => setOffset(offset), []);

	useEffect(() => {
		void loadCount();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setConnectionURI((window as any).connectionURI);
	}, [loadCount]);

	return (
		<div
			className="users-list"
			style={css}>
			<img
				className="title-image"
				src={LOGO_ICON_LIGHT}
				alt="Auth Page"
			/>
			<h1 className="users-list-title">User Management</h1>
			<p className="text-small users-list-subtitle">
				One place to manage all your users, revoke access and edit information according to your needs.
			</p>

			{connectionURI && <InfoConnection connectionURI={connectionURI} />}

			<div className="users-list-paper">
				{users.length === 0 && !loading && !errorOffsets.includes(0) ? (
					<NoUsers />
				) : (
					<UsersListTable
						users={users}
						offset={offset}
						count={count ?? 0}
						errorOffsets={errorOffsets}
						limit={limit}
						nextPaginationToken={nextPaginationToken}
						goToNext={(token) => loadUsers(token)}
						offsetChange={loadOffset}
						isLoading={loading}
						onSelect={onSelect}
					/>
				)}
			</div>
		</div>
	);
};

const fetchUsers = async (param?: { paginationToken?: string; limit?: number }) => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/users"),
		method: "GET",
		query: { ...param, limit: `${param?.limit ?? LIST_DEFAULT_LIMIT}` },
	});
	return response.ok ? ((await response?.json()) as UserPaginationList) : undefined;
};

const fetchCount = async () => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/users/count"),
		method: "GET",
	});

	return response.ok ? ((await response?.json()) as UserListCount) : undefined;
};

export const UserListPage = () => {
	const [selectedUser, setSelectedUser] = useState<UserWithRecipeId>();
	const isSelectedUserNotEmpty = selectedUser !== undefined;
	return (
		<AuthWrapper>
			{isSelectedUserNotEmpty && (
				<UserDetail
					user={selectedUser}
					onBackButtonClicked={() => setSelectedUser(undefined)}
					onDeleteCallback={() => {
						/* TODO */
					}}
					onUpdateCallback={() => {
						/* TODO */
					}}
				/>
			)}
			<UsersList
				onSelect={setSelectedUser}
				css={isSelectedUserNotEmpty ? { display: "none" } : undefined}
			/>
			<Footer
				colorMode="dark"
				horizontalAlignment="center"
				verticalAlignment="center"
			/>
		</AuthWrapper>
	);
};
export default UserListPage;
