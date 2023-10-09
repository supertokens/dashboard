import React, { useCallback, useContext, useState } from "react";
import useUserService, { UpdateUserInformationResponse, type IUpdateUserInformationArgs } from "../../../../api/user";
import useDeleteUserService from "../../../../api/user/delete";
import useVerifyUserEmail from "../../../../api/user/email/verify";
import useVerifyUserTokenService from "../../../../api/user/email/verify/token";
import usePasswordResetService from "../../../../api/user/password/reset";
import useUnlinkService from "../../../../api/user/unlink";
import { getImageUrl } from "../../../../utils";
import { formatLongDate } from "../../../../utils/index";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import { FEATURE_NOT_ENABLED_TEXT, UserRecipeType, type LoginMethod } from "../../../pages/usersList/types";
import CopyText from "../../copyText/CopyText";
import { LayoutPanel } from "../../layout/layoutPanel";
import TooltipContainer from "../../tooltip/tooltip";
import { useUserDetailContext } from "../context/UserDetailContext";
import {
	getDeleteUserToast,
	getInitlizeEmailVerificationRecipeTost,
	getLoginMethodUnlinkConfirmationProps,
	getSendEmailVerificationToast,
	getUnlinkUserToast,
	getUpdatePasswordToast,
	getUserChangePasswordPopupProps,
	getUserDeleteConfirmationProps,
} from "../userDetailForm";
import { DropDown } from "./components/dropDown";
import { EditableInput } from "./components/editableInput";
import "./loginMethods.scss";

const UserRecipeTypeText: Record<UserRecipeType, string> = {
	["emailpassword"]: "Email password",
	["passwordless"]: "Passwordless",
	["thirdparty"]: "Third party",
	["multiple"]: "Multiple",
};

const ProviderPill = ({ id, userId }: { id: string; userId: string }) => {
	const idToImage = () => {
		switch (id) {
			case "apple":
				return getImageUrl("provider-apple.svg");
			case "facebook":
				return getImageUrl("provider-facebook.svg");
			case "github":
				return getImageUrl("provider-github.svg");
			case "google":
				return getImageUrl("provider-google.svg");
			default:
				return getImageUrl("auth-provider.svg");
		}
	};

	const trim = (val: string) => {
		const len = val.length;
		return val.substring(0, Math.floor(len / 7)) + "..." + val.substring(6 * Math.floor(len / 7), len);
	};

	return (
		<span className="provider-pill">
			<img
				src={idToImage()}
				alt="Provider logo"
			/>{" "}
			| <CopyText copyVal={userId}>{trim(userId)}</CopyText>
		</span>
	);
};

const UserRecipePill = (loginMethod: LoginMethod) => {
	return (
		<div className={`pill ${loginMethod.recipeId} ${loginMethod.thirdParty?.id ?? ""}`}>
			<span>{UserRecipeTypeText[loginMethod.recipeId]}</span>
			{loginMethod.thirdParty && (
				<span
					className="thirdparty-name"
					title={loginMethod.thirdParty.id}>
					{" "}
					- {loginMethod.thirdParty.id}
				</span>
			)}
		</div>
	);
};

const VerifiedPill = ({ isVerified }: { isVerified: boolean }) => {
	if (!isVerified) {
		return <span className="not-verified">Not Verified</span>;
	} else return <span className="verified">Verified</span>;
};

const SendMailIcon = (props: JSX.IntrinsicElements["svg"]) => {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="22"
			viewBox="0 0 24 22"
			fill="none">
			<rect
				x="0.5"
				y="0.5"
				width="23"
				height="21"
				rx="5.5"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M6.72304 5.05149C6.60324 5.07574 6.37327 5.15907 6.21196 5.23667C5.71462 5.47592 5.27692 5.9695 5.11932 6.46887C4.99965 6.84799 4.99358 7.00277 5.00304 9.42606L5.01225 11.7833L5.09072 12.0286C5.20921 12.399 5.37599 12.6675 5.66237 12.9493C6.03962 13.3205 6.45709 13.5198 6.9564 13.5673L7.18977 13.5895L7.20834 14.0946C7.22807 14.6309 7.24123 14.6889 7.42382 15.0453C7.56455 15.32 7.92975 15.6748 8.21928 15.8181C8.63113 16.0219 8.6727 16.0262 10.1284 16.0166C11.3899 16.0083 11.4353 16.0059 11.5184 15.9449C11.6597 15.8411 11.7249 15.7305 11.7408 15.568C11.7598 15.3725 11.7372 15.2862 11.6356 15.1674C11.4629 14.9654 11.4857 14.9687 10.1146 14.9518C8.71738 14.9347 8.75886 14.9412 8.51538 14.6993C8.28469 14.47 8.29303 14.578 8.30196 11.9308L8.30992 9.5697L9.49231 10.2903C10.1426 10.6866 10.7377 11.0486 10.8147 11.0947C10.8917 11.1408 11.2388 11.3514 11.5859 11.5628C11.933 11.7742 12.3111 11.9823 12.426 12.0253C12.7244 12.137 13.042 12.1748 13.3414 12.1345C13.7967 12.0732 13.69 12.1317 16.7889 10.2425L17.8935 9.56912L17.909 10.9846L17.9246 12.4001L18.0122 12.5304C18.11 12.6757 18.2955 12.7765 18.4671 12.7776C18.6127 12.7785 18.8148 12.6768 18.9066 12.5564L18.9825 12.4568L18.9913 10.5894L19 8.72195L18.9209 8.4714C18.672 7.68316 17.9025 7.14534 17.0235 7.14534H16.82V7.0562C16.82 6.69088 16.5794 6.07944 16.3187 5.78224C16.0001 5.41901 15.5341 5.14012 15.0931 5.04861C14.7719 4.98203 7.05311 4.98466 6.72304 5.05149ZM14.9076 6.1208C15.2828 6.21573 15.5868 6.51476 15.6833 6.8839C15.7095 6.98425 15.731 7.08378 15.731 7.10509C15.731 7.13604 15.0321 7.1455 12.2538 7.15223L8.77665 7.16065L8.5253 7.2445C7.95141 7.43596 7.50095 7.86195 7.29394 8.40898L7.22185 8.59949L7.21248 10.5552L7.20312 12.511L7.04623 12.4927C6.68679 12.4508 6.36804 12.2133 6.19703 11.8598L6.10073 11.6609V9.30361V6.94635L6.17242 6.77179C6.30338 6.45286 6.61746 6.18386 6.9485 6.10711C7.01275 6.0922 8.7881 6.07864 10.8937 6.07693C14.2389 6.07426 14.7456 6.0798 14.9076 6.1208ZM17.4517 8.31932C17.5509 8.36729 17.6268 8.42224 17.6203 8.44146C17.6103 8.47091 16.3465 9.24979 14.0663 10.6317C13.38 11.0477 13.3441 11.0639 13.1079 11.0639C12.9486 11.0639 12.873 11.0457 12.7255 10.9717C12.4536 10.8355 8.59678 8.48184 8.58411 8.44443C8.56893 8.39961 8.79507 8.28034 8.95463 8.24903C9.02788 8.23464 10.9291 8.22496 13.1795 8.2275L17.2712 8.23213L17.4517 8.31932ZM16.7086 13.0506C16.4841 13.1509 16.3613 13.3769 16.3985 13.6212C16.4215 13.7722 16.5171 13.886 17.182 14.5538L17.563 14.9365L15.4102 14.9518C13.0293 14.9688 13.1608 14.9571 12.9809 15.1674C12.8793 15.2862 12.8567 15.3725 12.8757 15.568C12.8916 15.7305 12.9569 15.8411 13.0981 15.9449C13.1827 16.007 13.2173 16.0081 15.3754 16.0163C16.5807 16.0208 17.5668 16.0341 17.5668 16.0458C17.5668 16.0575 17.3224 16.3089 17.0237 16.6044C16.3567 17.2643 16.2946 17.3829 16.4504 17.6994C16.5788 17.9605 16.9254 18.0775 17.1778 17.9451C17.2292 17.9182 17.5937 17.5747 17.9879 17.1817C18.7468 16.4253 18.8393 16.3041 18.9524 15.9185C18.9929 15.7804 19.0024 15.6595 18.992 15.4114C18.9794 15.1114 18.9687 15.065 18.857 14.8274C18.7411 14.5807 18.7029 14.5365 18.0034 13.8383C17.126 12.9625 17.0328 12.9058 16.7086 13.0506Z"
			/>
			<rect
				x="0.5"
				y="0.5"
				width="23"
				height="21"
				rx="5.5"
			/>
		</svg>
	);
};

type MethodProps = {
	loginMethod: LoginMethod;
	onUpdateEmailVerificationStatusCallback: (
		userId: string,
		isVerified: boolean,
		tenantId: string | undefined
	) => Promise<boolean>;
	onDeleteCallback: () => void;
	onUnlinkCallback: () => void;
	onEditCallback: (val: IUpdateUserInformationArgs) => Promise<UpdateUserInformationResponse>;
	refetchAllData: () => Promise<void>;
	updateContext: (val: LoginMethod, ind: number) => void;
	index: number;
	showUnlink: boolean;
};

const Methods: React.FC<MethodProps> = ({
	loginMethod,
	onUpdateEmailVerificationStatusCallback,
	onDeleteCallback,
	onUnlinkCallback,
	onEditCallback,
	refetchAllData,
	updateContext,
	index,
	showUnlink,
}) => {
	const { sendUserEmailVerification: sendUserEmailVerificationApi } = useVerifyUserTokenService();
	const { showModal, showToast } = useContext(PopupContentContext);
	const [emailError, setEmailError] = useState("");
	const { getUserEmailVerificationStatus } = useVerifyUserEmail();

	const trim = (val: string) => {
		const len = val.length;
		return val.substring(0, Math.floor(len / 7)) + "..." + val.substring(6 * Math.floor(len / 7), len);
	};

	const sendUserEmailVerification = useCallback(
		async (userId: string, tenantId: string | undefined) => {
			const res = await getUserEmailVerificationStatus(userId);

			if (res.status === FEATURE_NOT_ENABLED_TEXT) {
				showToast(getInitlizeEmailVerificationRecipeTost());
				return;
			}

			const isSend = await sendUserEmailVerificationApi(userId, tenantId);
			showToast(getSendEmailVerificationToast(isSend));
			return isSend;
		},
		[sendUserEmailVerificationApi, showToast]
	);

	const [isEditing, setEdit] = useState(false);
	const { updatePassword } = usePasswordResetService();
	const [send, setSend] = useState<IUpdateUserInformationArgs>({
		userId: loginMethod.recipeUserId,
		recipeId: loginMethod.recipeId,
		recipeUserId: loginMethod.recipeUserId,
		tenantId: loginMethod.tenantIds[0],
		email: loginMethod.email,
		phone: loginMethod.phoneNumber,
		firstName: undefined,
		lastName: undefined,
	});
	const changePassword = useCallback(
		async (userId: string, newPassword: string) => {
			const response = await updatePassword(userId, newPassword, undefined);
			showToast(getUpdatePasswordToast(response.status === "OK"));
			// eslint-disable-next-line no-console
			console.log(response);
		},
		[showToast]
	);
	const openChangePasswordModal = useCallback(
		() =>
			showModal(
				getUserChangePasswordPopupProps({
					userId: loginMethod.recipeUserId,
					tenantIds: loginMethod.tenantIds ?? [],
				})
			),
		[showModal, loginMethod.recipeUserId, changePassword]
	);
	const changeEmailVerificationStatus = async () => {
		const res = await getUserEmailVerificationStatus(loginMethod.recipeUserId);

		if (res.status === FEATURE_NOT_ENABLED_TEXT) {
			showToast(getInitlizeEmailVerificationRecipeTost());
			return;
		}
		await onUpdateEmailVerificationStatusCallback(loginMethod.recipeUserId, !loginMethod.verified, undefined);
		await refetchAllData();
	};

	const updateUser = async () => {
		const resp = await onEditCallback(send);
		if (resp.status === "INVALID_EMAIL_ERROR") {
			setEmailError(resp.error);
		} else if (resp.status === "EMAIL_ALREADY_EXISTS_ERROR") {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Entered email already exists</>,
			});
		} else if (resp.status === "PHONE_ALREADY_EXISTS_ERROR") {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Entered phone number already exists</>,
			});
		} else {
			const tempLoginMethod = { ...loginMethod, email: send.email, phone: send.phone };
			updateContext(tempLoginMethod, index);
			setEdit(false);
		}
		await refetchAllData();
	};
	return (
		<div className="method">
			<div className="method-header">
				<div className="left">
					<UserRecipePill {...loginMethod} />
					<span className="user-id-span">
						User ID:
						<span className="copy-text-wrapper resp">
							<CopyText copyVal={loginMethod.recipeUserId}>{trim(loginMethod.recipeUserId)}</CopyText>
						</span>
						<span className="copy-text-wrapper">
							<CopyText>{loginMethod.recipeUserId}</CopyText>
						</span>
					</span>
				</div>
				<div className="right">
					{!isEditing && (
						<DropDown
							onEdit={() => setEdit(!isEditing)}
							onDelete={onDeleteCallback}
							onUnlink={onUnlinkCallback}
							showUnlink={showUnlink}
						/>
					)}
					{isEditing && (
						<>
							<button
								onClick={async () => {
									await refetchAllData();
									setEdit(false);
								}}
								className="button button-error-outline cancel">
								Cancel
							</button>
							<button
								onClick={updateUser}
								className="save-button">
								Save
							</button>
						</>
					)}
				</div>
			</div>
			<div className="method-body">
				<div>
					<EditableInput
						label={"Email ID"}
						val={loginMethod.email ?? ""}
						edit={loginMethod.recipeId === "thirdparty" ? false : isEditing}
						type={"email"}
						error={emailError}
						onChange={(val) => setSend({ ...send, email: val })}
					/>
				</div>
				<div>
					Is Email Verified?:&nbsp;{" "}
					<div className="pill-container">
						<VerifiedPill isVerified={loginMethod.verified} />
						{!isEditing && !loginMethod.verified && (
							<TooltipContainer
								tooltip="Send verification mail"
								position="right"
								tooltipWidth={170}>
								<SendMailIcon
									className="send-mail-icon"
									onClick={() =>
										sendUserEmailVerification(loginMethod.recipeUserId, loginMethod.tenantIds[0])
									}
								/>
							</TooltipContainer>
						)}
						{isEditing && (
							<span
								onClick={changeEmailVerificationStatus}
								className="password-link">
								{loginMethod.verified ? "Set as Unverified" : "Set as Verified"}
							</span>
						)}
					</div>
				</div>
				{loginMethod.recipeId === "thirdparty" && (
					<>
						<div>
							Created On:<b>{formatLongDate(loginMethod.timeJoined)}</b>
						</div>
						<div>
							{loginMethod.thirdParty && (
								<>
									Provider | Provider ID:&nbsp; <ProviderPill {...loginMethod.thirdParty} />
								</>
							)}
						</div>
					</>
				)}
				{loginMethod.recipeId === "passwordless" && (
					<>
						<div>
							Created On: <b>{formatLongDate(loginMethod.timeJoined)}</b>
						</div>
						<div>
							<EditableInput
								label={"Phone Number"}
								val={loginMethod.phoneNumber ?? ""}
								edit={isEditing}
								type={"phone"}
								onChange={(val) => setSend({ ...send, phone: val })}
							/>
						</div>
					</>
				)}
				{loginMethod.recipeId === "emailpassword" && (
					<>
						<div>
							Password:{" "}
							<span
								onClick={openChangePasswordModal}
								className="password-link">
								Change Password
							</span>
						</div>
						<div>
							Created On: <b>{formatLongDate(loginMethod.timeJoined)}</b>
						</div>
					</>
				)}
				{loginMethod.tenantIds && (
					<div>
						Tenants:{" "}
						{loginMethod.tenantIds.map((tenantId) => {
							return (
								<div
									key={tenantId}
									style={{ display: "inline" }}
									className="tenant-pill">
									{tenantId}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

type LoginMethodProps = { refetchAllData: () => Promise<void> };

export const LoginMethods: React.FC<LoginMethodProps> = ({ refetchAllData }) => {
	const { userDetail, setUserDetails } = useUserDetailContext();
	const { updateUserInformation } = useUserService();
	const methods = userDetail.details.loginMethods;
	const { deleteUser } = useDeleteUserService();
	const { unlinkUser } = useUnlinkService();
	const { showToast, showModal } = useContext(PopupContentContext);

	// Delete functions

	const onDeleteCallback = useCallback(
		async (userId: string) => {
			const deleteSucceed = await deleteUser(userId, false);
			const didSucceed = deleteSucceed !== undefined && deleteSucceed.status === "OK";
			showToast(getDeleteUserToast(didSucceed));
			await refetchAllData();
		},
		[showToast]
	);
	const openDeleteConfirmation = useCallback(
		(loginMethod: LoginMethod) =>
			showModal(
				getUserDeleteConfirmationProps({
					loginMethod: loginMethod,
					user: userDetail.details,
					onDeleteCallback: (user) => onDeleteCallback(user.id),
					all: false,
				})
			),
		[userDetail.details, onDeleteCallback, showModal]
	);

	// Unlink Functions

	const onUnlinkCallback = useCallback(
		async (userId: string) => {
			const deleteSucceed = await unlinkUser(userId);
			const didSucceed = deleteSucceed !== undefined && deleteSucceed.status === "OK";
			showToast(getUnlinkUserToast(didSucceed));
			await refetchAllData();
		},
		[showToast]
	);
	const openUnlinkConfirmation = useCallback(
		(loginMethod: LoginMethod) =>
			showModal(
				getLoginMethodUnlinkConfirmationProps({
					loginMethod: loginMethod,
					user: userDetail.details,
					unlinkCallback: () => onUnlinkCallback(loginMethod.recipeUserId),
				})
			),
		[userDetail.details, onDeleteCallback, showModal]
	);
	const onEditCallback = useCallback(async (vals: IUpdateUserInformationArgs) => {
		const resp = await updateUserInformation(vals);
		return resp;
	}, []);
	const updateLoginMethodInContext = (val: LoginMethod, ind: number) => {
		const tempUserDetails = userDetail;
		userDetail.details.loginMethods[ind] = val;
		setUserDetails({ ...tempUserDetails });
	};
	return (
		<LayoutPanel
			headerBorder={false}
			header={<div className="title">Login Methods</div>}>
			{methods.map((val, ind) => (
				<Methods
					loginMethod={val}
					onUpdateEmailVerificationStatusCallback={userDetail.func.onUpdateEmailVerificationStatusCallback}
					key={ind}
					onDeleteCallback={() => openDeleteConfirmation(val)}
					onUnlinkCallback={() => openUnlinkConfirmation(val)}
					onEditCallback={(val) => onEditCallback(val)}
					refetchAllData={refetchAllData}
					updateContext={updateLoginMethodInContext}
					index={ind}
					showUnlink={
						methods.length > 1 || (userDetail.details.isPrimaryUser === true && methods.length === 1)
					}
				/>
			))}
		</LayoutPanel>
	);
};
