import React, { useCallback, useContext, useState } from "react";
import "./loginMethods.scss";
import { LayoutPanel } from "../../layout/layoutPanel";
import { UserRecipeType } from "../../../pages/usersList/types";
import CopyText from "../../copyText/CopyText";
import { DropDown } from "./components/dropDown";
import { EditableInput } from "./components/editableInput";
import { getImageUrl } from "../../../../utils";
import { useUserDetailContext } from "../context/UserDetailContext";
import {
	getDeleteUserToast,
	getLoginMethodDeleteConfirmationProps,
	getSendEmailVerificationToast,
	getUpdatePasswordToast,
	getUserChangePasswordPopupProps,
} from "../userDetailForm";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import usePasswordResetService from "../../../../api/user/password/reset";
import { type LoginMethod } from "../../../pages/usersList/types";
import useDeleteUserService from "../../../../api/user/delete";
import useUnlinkService from "../../../../api/user/unlink";
import useUserService, { type IUpdateUserInformationArgs, UpdateUserInformationResponse } from "../../../../api/user";
import useVerifyUserTokenService from "../../../../api/user/email/verify/token";
import { formatLongDate } from "../../../../utils/index";

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
		<div className={`pill ${loginMethod.recipeId} ${loginMethod.thirdParty ?? ""}`}>
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

	const trim = (val: string) => {
		const len = val.length;
		return val.substring(0, Math.floor(len / 7)) + "..." + val.substring(6 * Math.floor(len / 7), len);
	};

	const sendUserEmailVerification = useCallback(
		async (userId: string, tenantId: string | undefined) => {
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
			const tempLoginMethod = { ...loginMethod, email: send.email };
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
							<CopyText>{trim(loginMethod.recipeUserId)}</CopyText>
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
						edit={isEditing}
						type={"email"}
						error={emailError}
						onChange={(val) => setSend({ ...send, email: val })}
					/>
				</div>
				<div>
					Is Email Verified ?:&nbsp; <VerifiedPill isVerified={loginMethod.verified} />
					<br />
					{!isEditing && !loginMethod.verified && (
						<span
							onClick={() =>
								sendUserEmailVerification(loginMethod.recipeUserId, loginMethod.tenantIds[0])
							}
							className="password-link">
							Send verification mail
						</span>
					)}
					{isEditing && (
						<span
							onClick={changeEmailVerificationStatus}
							className="password-link">
							{loginMethod.verified ? "Set as Unverified" : "Set as Verified"}
						</span>
					)}
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
				getLoginMethodDeleteConfirmationProps({
					loginMethod: loginMethod,
					user: userDetail.details,
					deleteCallback: onDeleteCallback,
				})
			),
		[userDetail.details, onDeleteCallback, showModal]
	);
	const onUnlinkCallback = useCallback(
		async (userId: string) => {
			const deleteSucceed = await unlinkUser(userId);
			const didSucceed = deleteSucceed !== undefined && deleteSucceed.status === "OK";
			showToast(getDeleteUserToast(didSucceed));
			await refetchAllData();
		},
		[showToast]
	);
	const openUnlinkConfirmation = useCallback(
		(loginMethod: LoginMethod) =>
			showModal(
				getLoginMethodDeleteConfirmationProps({
					loginMethod: loginMethod,
					user: userDetail.details,
					deleteCallback: () => onUnlinkCallback(loginMethod.recipeUserId),
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
					showUnlink={methods.length > 1}
				/>
			))}
		</LayoutPanel>
	);
};
