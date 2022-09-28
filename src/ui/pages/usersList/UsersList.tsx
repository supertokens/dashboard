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

import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { UserWithRecipeId } from "./types";
import AuthWrapper from "../../components/authWrapper";
import NoUsers from "../../components/noUsers/NoUsers";
import UsersListTable, {
	LIST_DEFAULT_LIMIT,
	OnSelectUserFunction,
} from "../../components/usersListTable/UsersListTable";
import "./UsersList.scss";
import { Footer, LOGO_ICON_LIGHT } from "../../components/footer/footer";
import InfoConnection from "../../components/info-connection/info-connection";
import UserDetail from "../../components/userDetail/userDetail";
import fetchUsers from "../../api/users";
import fetchCount from "../../api/users/count";
import { updateUser as updateUserApi, deleteUser as deleteUserApi, getUser } from "../../api/user"

type UserListPropsReloadRef = MutableRefObject<(() => Promise<void>) | undefined>;

type UserListProps = {
	onSelect: OnSelectUserFunction;
	css?: React.CSSProperties;
	/**
	 * a callback that can be used to trigger reloading the current active page
	 */
	reloadRef?: UserListPropsReloadRef
};

type NextPaginationTokenByOffset = Record<number, string | undefined>;

export const UsersList: React.FC<UserListProps> = ({ onSelect, css, reloadRef }) => {
	const limit = LIST_DEFAULT_LIMIT;
	const [count, setCount] = useState<number>();
	const [users, setUsers] = useState<UserWithRecipeId[]>([]);
	const [offset, setOffset] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [errorOffsets, setErrorOffsets] = useState<number[]>([]);
	const [connectionURI, setConnectionURI] = useState<string>();
	const [paginationTokenByOffset, setPaginationTokenByOffset ] = useState<NextPaginationTokenByOffset>({});

	const insertUsersAtOffset = useCallback((paramUsers: UserWithRecipeId[], paramOffset?: number) => {
		if (paramOffset === undefined) {
			return [ ...users, ...paramUsers]
		} return [ ...users.slice(0, paramOffset), ...paramUsers, ...users.slice(paramOffset + limit)]
	}, [users, limit])

	const getOffsetByPaginationToken = useCallback((paginationToken?: string) => {
		if (paginationToken === undefined) {
			return 0;
		}
		const matchedPaginationTokenByOffsetPair = Object.entries(paginationTokenByOffset).find(([ _, token]) => paginationToken === token);
		return matchedPaginationTokenByOffsetPair !== undefined ? parseInt(matchedPaginationTokenByOffsetPair[0]) : undefined;
	}, [paginationTokenByOffset])

	const loadUsers = useCallback(
		async (paginationToken?: string) => {
			const paramOffset = getOffsetByPaginationToken(paginationToken) ?? offset;
			console.log(paginationToken, paramOffset);
			setLoading(true);
			const nextOffset = paramOffset + limit;
			
			const data = await (paginationToken ? fetchUsers({ paginationToken }) : fetchUsers()).catch(
				() => undefined
			);
			if (data) {
				// store the users and pagination token
				const { users: responseUsers, nextPaginationToken } = data;
				setUsers(insertUsersAtOffset(responseUsers, paramOffset));
				setPaginationTokenByOffset({ ...paginationTokenByOffset, [nextOffset]: nextPaginationToken});
				setErrorOffsets(errorOffsets.filter((item) => item !== nextOffset));
				console.log(nextOffset, { ...paginationTokenByOffset, [nextOffset]: nextPaginationToken});
			} else {
				setErrorOffsets([paramOffset]);
			}
			setLoading(false);
			setOffset(paramOffset);
		},
		[offset, errorOffsets, limit, paginationTokenByOffset, insertUsersAtOffset, getOffsetByPaginationToken]
	);

	const loadCount = useCallback(async () => {
		setLoading(true);
		const [countResult] = await Promise.all([fetchCount().catch(() => undefined), loadUsers()]);
		if (countResult) {
			setCount(countResult.count);
		}
		setLoading(false);
	}, []);

	const loadOffset = useCallback(async (offset: number) => {
		await loadUsers(paginationTokenByOffset[offset])
	}, [ paginationTokenByOffset, loadUsers ]);

	useEffect(() => {
		loadCount();
		setConnectionURI((window as any).connectionURI);
	}, [loadCount]);

	useEffect(() => {
		if (reloadRef !== undefined) {
			reloadRef.current = () => loadOffset(offset)
		}
	}, [ reloadRef, loadOffset, offset ])

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
						nextPaginationToken={paginationTokenByOffset[offset + limit]}
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

export const UserListPage = () => {
	const [selectedUser, setSelectedUser] = useState<UserWithRecipeId>();
	const isSelectedUserNotEmpty = selectedUser !== undefined;
	const reloadListRef: UserListPropsReloadRef = useRef();

	const backToList = useCallback(() => {
		void reloadListRef.current?.();
		setSelectedUser(undefined);
	}, []);

	const updateUser = useCallback(async (userId: string, data: UserWithRecipeId) => {
		if ((await updateUserApi(userId, data)) === true) {
			setSelectedUser(await getUser(userId));
		} else {
			console.log("setSelectedUser", selectedUser)
			setSelectedUser({ ...selectedUser!} );
		}
	}, [ selectedUser ])

	const deleteUser = useCallback(async (userId: string) => {
		if ((await deleteUserApi(userId)) === true) {
			backToList();
		}
	}, [ backToList ]);

	return (
		<AuthWrapper>
			{isSelectedUserNotEmpty && (
				<UserDetail
					user={selectedUser}
					onBackButtonClicked={backToList}
					onUpdateCallback={updateUser}
					onDeleteCallback={({user: {id}}) => deleteUser(id)}
				/>
			)}
			<UsersList
				onSelect={(user) => setSelectedUser({ ...user, user: { ...user.user } as any })}
				css={isSelectedUserNotEmpty ? { display: "none" } : undefined}
				reloadRef={reloadListRef}
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
