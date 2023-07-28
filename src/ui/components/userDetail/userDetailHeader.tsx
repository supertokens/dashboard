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

import { FC, useCallback, useContext } from "react";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import { UserProps, UserWithRecipeId } from "../../pages/usersList/types";
import CopyText from "../copyText/CopyText";
import { UserDetailProps } from "./userDetail";
import { getUserDeleteConfirmationProps } from "./userDetailForm";

type UserDetailBaseProps = {
	user: UserWithRecipeId;
};

const getBadgeInitial = ({ firstName, lastName, emails, id, recipeId }: UserWithRecipeId) => {
	let firstnameToUse = "";
	let lastNameToUse = "";

	if (firstName !== undefined && firstName !== "FEATURE_NOT_ENABLED") {
		firstnameToUse = firstName;
	}

	if (lastName !== undefined && lastName !== "FEATURE_NOT_ENABLED") {
		lastNameToUse = lastName;
	}
	// concatting the firstName & lastname to handle
	// the case if user enters full name in either firstname or last name
	const fullName = `${firstnameToUse ?? ""} ${lastNameToUse ?? ""}`.trim();
	if (fullName?.length > 0) {
		const splitFullName = fullName.split(" ");
		return splitFullName.length > 1 ? `${splitFullName[0][0]}${splitFullName[1][0]}` : splitFullName[0].slice(0, 2);
	}
	if (emails.length > 0 && emails[0].trim().length > 0) {
		const splittedEmailName = emails[0].trim().split("@")[0].split(".");
		return splittedEmailName.length > 1
			? `${splittedEmailName[0][0]}${splittedEmailName[1][0]}`
			: splittedEmailName[0].slice(0, 2);
	}

	// If we dont have a name or email for the user just use "ST" as the inital
	return "ST";
};

export const UserDisplayName: FC<UserProps> = ({ user }) => {
	const { firstName, lastName, emails } = user;
	const phone = user.recipeId === "passwordless" ? user.phoneNumbers[0] : undefined;

	let firstNameToUse = firstName ?? "";
	let lastNameToUse = lastName ?? "";

	if (firstNameToUse === "FEATURE_NOT_ENABLED") {
		firstNameToUse = "";
	}

	if (lastNameToUse === "FEATURE_NOT_ENABLED") {
		lastNameToUse = "";
	}

	const fullName = `${firstNameToUse} ${lastNameToUse}`.trim();

	return <span>{fullName || emails[0] || phone}</span>;
};

export const UserDetailBadge: React.FC<UserProps> = ({ user }: UserProps) => (
	<div className="user-detail__header__badge">{getBadgeInitial(user)}</div>
);

export type UserDetailHeaderProps = UserDetailProps & {
	userDetail: UserWithRecipeId;
};

export const UserDetailHeader: React.FC<UserDetailHeaderProps> = ({
	userDetail,
	onDeleteCallback,
}: UserDetailHeaderProps) => {
	const { id } = userDetail;
	const { showModal } = useContext(PopupContentContext);

	const openDeleteConfirmation = useCallback(
		() =>
			showModal(
				getUserDeleteConfirmationProps({
					onDeleteCallback,
					user: userDetail,
				})
			),
		[userDetail, onDeleteCallback, showModal]
	);

	return (
		<div className="user-detail__header">
			<UserDetailBadge user={userDetail} />
			<div className="user-detail__header__info">
				<div className="user-detail__header__title">
					<span>
						<UserDisplayName user={userDetail} />
					</span>
				</div>
				<div className="user-detail__header__user-id">
					<span className="user-detail__header__user-id__label">User ID:</span>
					<span
						className="user-detail__header__user-id__text block-snippet-large"
						title={id}>
						<CopyText>{id}</CopyText>
					</span>
				</div>
			</div>
			<div className="user-detail__header__action">
				<button
					className="button button-error"
					onClick={openDeleteConfirmation}>
					Delete
				</button>
			</div>
		</div>
	);
};

export default UserDetailHeader;
