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

import React, { useCallback } from "react";
import { getImageUrl } from "../../../utils";
import { UserWithRecipeId } from "../../pages/usersList/types";
import { OnSelectUserFunction } from "../usersListTable/UsersListTable";
import UserDetailHeader from "./userDetailHeader";
import "./userDetail.scss";
import UserDetailInfoGrid from "./userDetailInfoGrid";

export type UserDetailProps = {
	user: UserWithRecipeId;
	onBackButtonClicked: () => void;
	onDeleteCallback?: OnSelectUserFunction;
	onUpdateCallback?: (userId: string, updatedValue: Partial<UserWithRecipeId>) => void;
};

export const UserDetail: React.FC<UserDetailProps> = (props) => {
	const { user, onBackButtonClicked, onUpdateCallback } = props;

	const onUpdate = useCallback(
		(updatedValue: Partial<UserWithRecipeId>) => {
			if (onUpdateCallback !== undefined) {
				onUpdateCallback(user.user.id, updatedValue);
			}
		},
		[onUpdateCallback, user]
	);

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
			<UserDetailHeader {...props} />
			<UserDetailInfoGrid
				user={user}
				onUpdateCallback={onUpdate}
			/>
		</div>
	);
};

export default UserDetail;
