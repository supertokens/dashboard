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
import { getImageUrl } from "../../../utils";
import { getUser } from "../../api/user";
import { UserWithRecipeId } from "../../pages/usersList/types";
import { OnSelectUserFunction } from "../usersListTable/UsersListTable";
import "./userDetail.scss";
import UserDetailHeader from "./userDetailHeader";
import UserDetailInfoGrid from "./userDetailInfoGrid";
import { UserDetailsSessionList } from "./userDetailSessionList";

export type UserDetailProps = {
	user: string;
	recipeId: string;
	onBackButtonClicked: () => void;
	onDeleteCallback: OnSelectUserFunction;
	onUpdateCallback: (userId: string, updatedValue: UserWithRecipeId) => void;
	onSendEmailVerificationCallback: (user: UserWithRecipeId) => Promise<boolean>;
	onUpdateEmailVerificationStatusCallback: (userId: string, isVerified: boolean) => Promise<boolean>;
	onChangePasswordCallback: (userId: string, newPassword: string) => void;
};

export const UserDetail: React.FC<UserDetailProps> = (props) => {
	const { onBackButtonClicked, user, recipeId } = props;
	const [userDetail, setUserDetail] = useState<UserWithRecipeId | undefined>(undefined);

	const loadUserDetail = useCallback(async () => {
		const userDetailsResponse = await getUser(user, recipeId);
		setUserDetail(userDetailsResponse);
	}, []);

	useEffect(() => {
		void loadUserDetail();
	}, [loadUserDetail]);

	if (userDetail === undefined) {
		return <></>;
	}

	return (
		<div className="user-detail">
			<div className="user-detail__navigation">
				<button
					className="button flat"
					onClick={onBackButtonClicked}>
					<img
						src={getImageUrl("left-arrow-dark.svg")}
						alt="Back to all users"
					/>
					<span>Back to all users</span>
				</button>
			</div>
			<UserDetailHeader
				userDetail={userDetail}
				{...props}
			/>
			<UserDetailInfoGrid
				userDetail={userDetail}
				{...props}
			/>
			<UserDetailsSessionList userId={user} />
		</div>
	);
};

export default UserDetail;
