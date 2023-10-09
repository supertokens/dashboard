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

import React, { useCallback, useContext, useEffect, useState } from "react";
import { Tenant } from "../../../api/tenants/list";
import { GetUserInfoResult, UpdateUserInformationResponse, useUserService } from "../../../api/user";
import useMetadataService from "../../../api/user/metadata";
import useSessionsForUserService from "../../../api/user/sessions";
import { getImageUrl, getRecipeNameFromid } from "../../../utils";
import { getTenantsObjectsForIds } from "../../../utils/user";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import { User, UserRecipeType } from "../../pages/usersList/types";
import { getMissingTenantIdModalProps } from "../common/modals/TenantIdModals";
import { OnSelectUserFunction } from "../usersListTable/UsersListTable";
import { UserDetailContextProvider } from "./context/UserDetailContext";
import { LoginMethods } from "./loginMethods/LoginMethods";
import "./tenantList/UserTenantsList.scss";
import "./userDetail.scss";
import { getUpdateUserToast } from "./userDetailForm";
import UserDetailHeader from "./userDetailHeader";
import UserDetailInfoGrid from "./userDetailInfoGrid";
import { SessionInfo, UserDetailsSessionList } from "./userDetailSessionList";
import { UserMetaDataSection } from "./userMetaDataSection";

export type UserDetailProps = {
	user: string;
	onBackButtonClicked: () => void;
	onDeleteCallback: OnSelectUserFunction;
	onSendEmailVerificationCallback: (user: User) => Promise<boolean>;
	onUpdateEmailVerificationStatusCallback: (
		userId: string,
		isVerified: boolean,
		tenantId: string | undefined
	) => Promise<boolean>;
	onChangePasswordCallback: (userId: string, newPassword: string) => Promise<void>;
};

export const UserDetail: React.FC<UserDetailProps> = (props) => {
	const { onBackButtonClicked, user, onUpdateEmailVerificationStatusCallback } = props;
	const [userDetail, setUserDetail] = useState<GetUserInfoResult | undefined>(undefined);
	const [sessionList, setSessionList] = useState<SessionInfo[] | undefined>(undefined);
	const [userMetaData, setUserMetaData] = useState<string | undefined>(undefined);
	const [shouldShowLoadingOverlay, setShowLoadingOverlay] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(false);

	const { getUser, updateUserInformation } = useUserService();
	const { getUserMetaData } = useMetadataService();
	const { getSessionsForUser } = useSessionsForUserService();
	const { showModal } = useContext(PopupContentContext);

	const loadUserDetail = useCallback(async () => {
		const userDetailsResponse = await getUser(user);
		setUserDetail(JSON.parse(JSON.stringify(userDetailsResponse)));
	}, []);

	const { showToast } = useContext(PopupContentContext);

	const updateUser = useCallback(
		async (
			userId: string,
			data: User,
			tenantListFromStore: Tenant[] | undefined
		): Promise<
			| UpdateUserInformationResponse
			| {
					status: "NO_API_CALLED";
			  }
		> => {
			let tenantId: string | undefined;
			const tenants: Tenant[] = getTenantsObjectsForIds(tenantListFromStore ?? [], data.tenantIds);
			let matchingTenants: Tenant[] = [];

			const PrimaryLoginMethod = data.loginMethods.filter((el) => el.recipeUserId === data.id)[0];

			if (PrimaryLoginMethod.recipeId === "emailpassword") {
				matchingTenants = tenants.filter((tenant) => tenant.emailPassword.enabled);
			}

			if (PrimaryLoginMethod.recipeId === "passwordless") {
				matchingTenants = tenants.filter((tenant) => tenant.passwordless.enabled);
			}

			if (PrimaryLoginMethod.recipeId === "thirdparty") {
				matchingTenants = tenants.filter((tenant) => tenant.thirdParty.enabled);
			}

			if (matchingTenants.length > 0) {
				tenantId = matchingTenants[0].tenantId;
			}

			if (tenantId === undefined) {
				setShowLoadingOverlay(false);
				showModal(
					getMissingTenantIdModalProps({
						message: `User does not belong to a tenant that has the ${PrimaryLoginMethod.recipeId} recipe enabled`,
					})
				);

				return {
					status: "NO_API_CALLED",
				};
			}

			const userInfoResponse = await updateUserInformation({
				userId,
				recipeId: PrimaryLoginMethod.recipeId,
				recipeUserId: PrimaryLoginMethod.recipeUserId,
				email: PrimaryLoginMethod.email,
				phone: PrimaryLoginMethod.recipeId === "passwordless" ? PrimaryLoginMethod.phoneNumber : "",
				firstName: data.firstName,
				lastName: data.lastName,
				tenantId,
			});
			showToast(getUpdateUserToast(userInfoResponse.status === "OK"));
			return userInfoResponse;
		},
		[showToast]
	);

	const fetchUserMetaData = useCallback(async () => {
		const metaDataResponse = await getUserMetaData(user);

		if (metaDataResponse === "FEATURE_NOT_ENABLED_ERROR") {
			setUserMetaData("Feature Not Enabled");
		} else if (metaDataResponse !== undefined) {
			setUserMetaData(JSON.stringify(metaDataResponse));
		} else {
			setUserMetaData("{}");
		}
	}, []);

	const fetchSession = useCallback(async () => {
		let response = await getSessionsForUser(user);

		if (response === undefined) {
			response = [];
		}

		setSessionList(response);
	}, []);

	const showLoadingOverlay = () => {
		setShowLoadingOverlay(true);
	};

	const hideLoadingOverlay = () => {
		setShowLoadingOverlay(false);
	};

	const fetchData = async () => {
		setIsLoading(true);
		await loadUserDetail();
		await fetchUserMetaData();
		await fetchSession();
		setIsLoading(false);
	};

	const refetchAllData = async () => {
		setShowLoadingOverlay(true);
		await loadUserDetail();
		await fetchUserMetaData();
		await fetchSession();
		setShowLoadingOverlay(false);
	};

	useEffect(() => {
		void fetchData();
	}, []);

	if (userDetail === undefined || isLoading) {
		return (
			<div className="user-detail-page-loader">
				<div className="loader"></div>
			</div>
		);
	}

	if (userDetail.status === "NO_USER_FOUND_ERROR") {
		return (
			<div className="user-detail center-children">
				<p className="subtitle">User could not be found</p>
				<span
					className="back-button"
					onClick={onBackButtonClicked}>
					Back
				</span>
			</div>
		);
	}

	if (userDetail.status === "RECIPE_NOT_INITIALISED") {
		const recipeName = getRecipeNameFromid("" as UserRecipeType);

		return (
			<div className="user-detail center-children">
				<p className="subtitle">{`${recipeName} recipe has not been initialised`}</p>
				<span
					className="back-button"
					onClick={onBackButtonClicked}>
					Back
				</span>
			</div>
		);
	}

	const userFunctions = {
		refetchAllData: refetchAllData,
		updateUser: updateUser,
		onUpdateEmailVerificationStatusCallback: onUpdateEmailVerificationStatusCallback,
	};
	return (
		<UserDetailContextProvider
			showLoadingOverlay={showLoadingOverlay}
			hideLoadingOverlay={hideLoadingOverlay}
			metaData={userMetaData}
			details={userDetail.user}
			sessions={sessionList}
			func={userFunctions}
			userId={user}>
			<div className="user-detail">
				{shouldShowLoadingOverlay && (
					<div className="full-screen-loading-overlay">
						<div className="loader-container">
							<div className="loader"></div>
						</div>
					</div>
				)}
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

				{/* {userDetail.user.tenantIds.length > 0 && <UserTenantsList tenantIds={userDetail.user.tenantIds} />}*/}

				<UserDetailInfoGrid {...props} />

				<LoginMethods refetchAllData={refetchAllData} />

				<UserMetaDataSection />

				<UserDetailsSessionList />
			</div>
		</UserDetailContextProvider>
	);
};

export default UserDetail;
