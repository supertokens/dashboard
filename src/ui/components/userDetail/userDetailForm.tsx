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

import { FC, useContext, useState } from "react";
import { Tenant } from "../../../api/tenants/list";
import { useUserService } from "../../../api/user";
import usePasswordResetService from "../../../api/user/password/reset";
import { getImageUrl } from "../../../utils";
import { ForbiddenError } from "../../../utils/customErrors";
import { getTenantsObjectsForIds } from "../../../utils/user";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import { useTenantsListContext } from "../../contexts/TenantsListContext";
import { LoginMethod, UserProps } from "../../pages/usersList/types";
import { getMissingTenantIdModalProps } from "../common/modals/TenantIdModals";
import InputField from "../inputField/InputField";
import { LayoutModalProps } from "../layout/layoutModal";
import { ToastNotificationProps } from "../toast/toastNotification";
import { OnSelectUserFunction } from "../usersListTable/UsersListTable";
import "./userDetailForm.scss";

type PasswordChangeCallback = (password?: string) => Promise<void>;

type UserDetailChangePasswordFormProps = {
	onPasswordChange: PasswordChangeCallback;
	userId: string;
	tenantIds: string[];
};

type UserDetailChangeEmailFormProps = {
	onEmailChange: (success: boolean) => Promise<void>;
	userId: string;
	recipeId: "emailpassword" | "passwordless";
	tenantIds: string[];
	recipeUserId: string;
};

type UserDetailChangePhoneFormProps = {
	onPhoneChange: PasswordChangeCallback;
	userId: string;
	tenantIds: string[];
};

type UserDeleteConfirmationProps = UserProps & {
	onConfirmed: (isConfirmed: boolean) => void;
	loginMethod?: LoginMethod;
	all: boolean;
};

type UserUnlinkConfirmationProps = { onConfirmed: (isConfirmed: boolean) => void; loginMethod: LoginMethod };

type UserDeleteConfirmationTriggerProps = UserProps & {
	onDeleteCallback: OnSelectUserFunction;
	loginMethod?: LoginMethod;
	all: boolean;
};

export type UserDetailChangePasswordPopupProps = Omit<LayoutModalProps, "modalContent"> & {
	userId: string;
	tenantIds: string[];
};

export type UserDetailChangeEmailPopupProps = Omit<LayoutModalProps, "modalContent"> & {
	userId: string;
	recipeId: "emailpassword" | "passwordless";
	onEmailChanged: () => Promise<void>;
	tenantIds: string[];
	recipeUserId: string;
};

export type UserDetailChangePhonePopupProps = Omit<LayoutModalProps, "modalContent"> & {
	userId: string;
	tenantIds: string[];
};

export const getUserChangeEmailPopupProps = (props: UserDetailChangeEmailPopupProps) => {
	const closeModalRef: React.MutableRefObject<(() => void) | undefined> = { current: undefined };

	const onModalClose = async (success: boolean) => {
		if (success) {
			await props.onEmailChanged();
		}

		if (closeModalRef.current !== undefined) {
			closeModalRef.current();
		}
	};

	const modalContent = (
		<UserDetailChangeEmailForm
			onEmailChange={onModalClose}
			userId={props.userId}
			recipeId={props.recipeId}
			tenantIds={props.tenantIds}
			recipeUserId={props.recipeUserId}
		/>
	);

	return {
		...props,
		header: <h2 className="user-detail-form__header">Change Email</h2>,
		modalContent: modalContent,
		closeCallbackRef: closeModalRef,
	} as LayoutModalProps;
};

export const getUserChangePasswordPopupProps = (props: UserDetailChangePasswordPopupProps) => {
	const closeModalRef: React.MutableRefObject<(() => void) | undefined> = { current: undefined };

	const onModalClose = async (password?: string) => {
		if (closeModalRef.current !== undefined) {
			closeModalRef.current();
		}
	};

	const modalContent = (
		<UserDetailChangePasswordForm
			onPasswordChange={onModalClose}
			userId={props.userId}
			tenantIds={props.tenantIds}
		/>
	);

	return {
		...props,
		header: <h2 className="user-detail-form__header">Change Password</h2>,
		modalContent: modalContent,
		closeCallbackRef: closeModalRef,
	} as LayoutModalProps;
};

export const UserDetailChangeEmailForm: FC<UserDetailChangeEmailFormProps> = (
	props: UserDetailChangeEmailFormProps
) => {
	const { onEmailChange, userId, recipeId, recipeUserId } = props;
	const [email, setEmail] = useState<string>();
	const [repeatEmail, setRepeatEmail] = useState<string>();
	const [apiError, setApiError] = useState<string | undefined>(undefined);
	const { showToast } = useContext(PopupContentContext);
	const { updateUserInformation } = useUserService();
	const { tenantsListFromStore } = useTenantsListContext();
	const { showModal } = useContext(PopupContentContext);

	const isEmailMatch = email === repeatEmail;

	const onSave = async () => {
		if (email === undefined) {
			return;
		}

		let tenantId: string | undefined;
		const tenants: Tenant[] = getTenantsObjectsForIds(tenantsListFromStore ?? [], props.tenantIds);
		let matchingTenants: Tenant[] = [];

		if (recipeId === "emailpassword") {
			matchingTenants = tenants.filter((tenant) => tenant.emailPassword.enabled === true);
		}

		if (recipeId === "passwordless") {
			matchingTenants = tenants.filter((tenant) => tenant.passwordless.enabled === true);
		}

		if (matchingTenants.length > 0) {
			tenantId = matchingTenants[0].tenantId;
		}

		if (tenantId === undefined) {
			await onCancel();
			showModal(
				getMissingTenantIdModalProps({
					message: `User does not belong to a tenant that has the ${recipeId} recipe enabled`,
				})
			);
			return;
		}

		try {
			const response = await updateUserInformation({
				userId,
				email,
				recipeId,
				tenantId,
				recipeUserId,
			});

			if (response.status === "INVALID_EMAIL_ERROR") {
				setApiError(response.error);
			} else if (response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
				setApiError("A user with this email already exists");
			} else if (response.status === "OK") {
				showToast(getUpdateEmailToast(true));
				await onEmailChange(true);
			}
		} catch (error) {
			if (ForbiddenError.isThisError(error)) {
				void onCancel();
			}
		}
	};

	const onCancel = async () => {
		setEmail(undefined);
		setRepeatEmail(undefined);
		await onEmailChange(false);
	};

	return (
		<>
			<div className="user-detail-form">
				<InputField
					name="email"
					type="email"
					label="New Email"
					isRequired={true}
					hideColon={true}
					error={apiError}
					handleChange={({ target: { value } }) => setEmail(value)}
				/>
				<InputField
					name="repeatEmail"
					type="email"
					label="Confirm Email"
					isRequired={true}
					hideColon={true}
					error={repeatEmail !== undefined && !isEmailMatch ? "Email does not match" : undefined}
					handleChange={({ target: { value } }) => setRepeatEmail(value)}
				/>
				<div className="user-detail-form__actions">
					<button
						className="button outline"
						onClick={onCancel}>
						Cancel
					</button>
					<button
						className="button"
						disabled={false}
						onClick={onSave}>
						Save
					</button>
				</div>
			</div>
		</>
	);
};

export const UserDetailChangePasswordForm: FC<UserDetailChangePasswordFormProps> = (
	props: UserDetailChangePasswordFormProps
) => {
	const { onPasswordChange, userId } = props;
	const [password, setPassword] = useState<string>();
	const [repeatPassword, setRepeatPassword] = useState<string>();
	const [apiError, setApiError] = useState<string | undefined>(undefined);
	const { showToast } = useContext(PopupContentContext);
	const { updatePassword } = usePasswordResetService();
	const { tenantsListFromStore } = useTenantsListContext();
	const { showModal } = useContext(PopupContentContext);

	const isPasswordMatch = password === repeatPassword;

	const onSave = async () => {
		if (password === undefined) {
			return;
		}

		const tenants = getTenantsObjectsForIds(tenantsListFromStore ?? [], props.tenantIds);
		const matchingTenantIds = tenants.filter((_tenant) => _tenant.emailPassword.enabled === true);

		if (matchingTenantIds.length === 0) {
			await onCancel();
			showModal(
				getMissingTenantIdModalProps({
					message: "User does not belong to a tenant that has the emailpassword recipe enabled",
				})
			);
			return;
		}

		try {
			const response = await updatePassword(
				userId,
				password,
				matchingTenantIds.length > 0 ? matchingTenantIds[0].tenantId : undefined
			);

			if (response?.status === "INVALID_PASSWORD_ERROR") {
				setApiError(response.error);
			} else if (response?.status === "OK") {
				showToast(getUpdatePasswordToast(true));
				await onPasswordChange();
			}
		} catch (error) {
			if (ForbiddenError.isThisError(error)) {
				void onCancel();
			}
		}
	};

	const onCancel = async () => {
		setPassword(undefined);
		setRepeatPassword(undefined);
		await onPasswordChange();
	};

	return (
		<>
			<div className="user-detail-form">
				<InputField
					name="password"
					type="password"
					label="New Password"
					isRequired={true}
					hideColon={true}
					error={apiError}
					handleChange={({ target: { value } }) => setPassword(value)}
				/>
				<br />
				<InputField
					name="repeatPassword"
					type="password"
					label="Confirm Password"
					isRequired={true}
					hideColon={true}
					error={repeatPassword !== undefined && !isPasswordMatch ? "Passwords do not match" : undefined}
					handleChange={({ target: { value } }) => setRepeatPassword(value)}
				/>
				<div className="user-detail-form__actions">
					<button
						className="button outline"
						onClick={onCancel}>
						Cancel
					</button>
					<button
						className="button"
						disabled={false}
						onClick={onSave}>
						Save
					</button>
				</div>
			</div>
		</>
	);
};

export const LoginMethodUnlinkConfirmation: FC<UserUnlinkConfirmationProps> = ({ onConfirmed, loginMethod }) => {
	const [inputValue, setInputValue] = useState<string>("");
	const [showError, shouldShowError] = useState(false);

	let informationToEnter = "Confirm";
	let inputType = "following information";

	if (loginMethod.recipeId === "emailpassword" || loginMethod.recipeId === "thirdparty") {
		informationToEnter = loginMethod.email ?? "";
		inputType = "user's email id";
	}

	if (loginMethod.recipeId === "passwordless") {
		informationToEnter = loginMethod.phoneNumber !== undefined ? loginMethod.phoneNumber : loginMethod.email ?? "";
		inputType = "user's phone number";
	}

	const onUnlinkPressed = () => {
		if (informationToEnter !== inputValue) {
			shouldShowError(true);
			return;
		}

		onConfirmed(true);
	};

	return (
		<div className="user-detail-form">
			<p>
				Are you sure you want to unlink the selected Login method <span>{loginMethod.recipeId}</span>?
			</p>
			<p>
				To unlink the user, please confirm by typing the {inputType}: <span>{informationToEnter}</span> below
			</p>
			<div className="user-delete-input-container">
				<InputField
					type="text"
					name="input"
					error={showError ? "Incorrect entry" : undefined}
					value={inputValue}
					handleChange={({ target: { value } }) => setInputValue(value)}
				/>
			</div>
			<div className="user-detail-form__actions">
				<button
					className="button outline"
					onClick={() => onConfirmed(false)}>
					Cancel
				</button>
				<button
					className="button button-error"
					onClick={onUnlinkPressed}
					disabled={inputValue === ""}>
					Yes, Unlink
				</button>
			</div>
		</div>
	);
};

export const LoginMethodDeleteConfirmation: FC<UserDeleteConfirmationProps & { loginMethod: LoginMethod }> = ({
	user,
	onConfirmed,
	loginMethod,
}) => {
	const [inputValue, setInputValue] = useState<string>("");
	const [showError, shouldShowError] = useState(false);

	let informationToEnter = "Confirm";
	let inputType = "following information";

	if (user.emails.length > 0) {
		informationToEnter = loginMethod.email ?? user.emails[0];
		inputType = "user's email id";
	}

	if (loginMethod.recipeId === "passwordless" && loginMethod.phoneNumber !== undefined) {
		informationToEnter = loginMethod.phoneNumber;
		inputType = "user's phone number";
	}

	const onDeletePressed = () => {
		if (informationToEnter !== inputValue) {
			shouldShowError(true);
			return;
		}

		onConfirmed(true);
	};

	return (
		<div className="user-detail-form">
			<p>Are you sure you want to unlink the selected Login method {loginMethod.recipeId}?</p>
			<p>
				Please confirm by typing the {inputType}: <span>{informationToEnter}</span> below
			</p>
			<div className="user-delete-input-container">
				<InputField
					type="text"
					name="input"
					error={showError ? "Incorrect entry" : undefined}
					value={inputValue}
					handleChange={({ target: { value } }) => setInputValue(value)}
				/>
			</div>
			<div className="user-detail-form__actions">
				<button
					className="button outline"
					onClick={() => onConfirmed(false)}>
					Cancel
				</button>
				<button
					className="button button-error"
					onClick={onDeletePressed}
					disabled={inputValue === ""}>
					Yes, Unlink
				</button>
			</div>
		</div>
	);
};

export const UserDeleteConfirmation: FC<UserDeleteConfirmationProps> = ({ user, onConfirmed, loginMethod }) => {
	const [inputValue, setInputValue] = useState<string>("");
	const [showError, shouldShowError] = useState(false);

	let informationToEnter = "Confirm";
	let inputType = "following information";

	if (user.emails.length > 0) {
		informationToEnter = user.emails[0];
		inputType = "user's email id";
	}

	if (user.loginMethods[0].recipeId === "passwordless" && user.phoneNumbers[0] !== undefined) {
		informationToEnter = user.phoneNumbers[0];
		inputType = "user's phone number";
	}

	if (loginMethod !== undefined) {
		if (loginMethod.email !== undefined) {
			informationToEnter = loginMethod.email;
			inputType = "user's email id";
		} else if (loginMethod.recipeId === "passwordless") {
			informationToEnter = loginMethod.phoneNumber ?? loginMethod.email ?? "";
			inputType = loginMethod.phoneNumber ? "user's phone number" : "user's email id";
		}
	}

	const onDeletePressed = () => {
		if (informationToEnter !== inputValue) {
			shouldShowError(true);
			return;
		}

		onConfirmed(true);
	};

	return (
		<div className="user-detail-form">
			<p>
				To delete the user, please confirm by typing the {inputType}: <span>{informationToEnter}</span> below
			</p>
			<p>{""}</p>
			<p>This will also delete any accounts linked to this user</p>
			<div className="user-delete-input-container">
				<InputField
					type="text"
					name="input"
					error={showError ? "Incorrect entry" : undefined}
					value={inputValue}
					handleChange={({ target: { value } }) => setInputValue(value)}
				/>
			</div>
			<div className="user-detail-form__actions">
				<button
					className="button outline"
					onClick={() => onConfirmed(false)}>
					Cancel
				</button>
				<button
					className="button button-error"
					onClick={onDeletePressed}
					disabled={inputValue === ""}>
					Delete Forever
				</button>
			</div>
		</div>
	);
};

export const getUserDeleteConfirmationProps = (props: UserDeleteConfirmationTriggerProps) => {
	const { user, onDeleteCallback, loginMethod, all } = props;
	const closeConfirmDeleteRef: React.MutableRefObject<(() => void) | undefined> = { current: undefined };

	const onConfirmedDelete = (isConfirmed: boolean) => {
		if (isConfirmed) {
			onDeleteCallback(user);
		}
		closeConfirmDeleteRef.current?.();
	};

	return {
		modalContent: (
			<UserDeleteConfirmation
				loginMethod={loginMethod}
				all={all}
				user={user}
				onConfirmed={onConfirmedDelete}
			/>
		),
		header: <h2>Delete User?</h2>,
		closeCallbackRef: closeConfirmDeleteRef,
	} as LayoutModalProps;
};

export type deleteLoginMethodProps = {
	loginMethod: LoginMethod;
	deleteCallback: (userId: string) => void;
} & UserProps;

export type UnlinkLoginMethodProps = {
	loginMethod: LoginMethod;
	unlinkCallback: (userId: string) => void;
} & UserProps;

export const getLoginMethodUnlinkConfirmationProps = (props: UnlinkLoginMethodProps) => {
	const { user, loginMethod, unlinkCallback } = props;
	const closeConfirmDeleteRef: React.MutableRefObject<(() => void) | undefined> = { current: undefined };

	const onConfirmedUnlink = (isConfirmed: boolean) => {
		if (isConfirmed) {
			unlinkCallback("");
		}
		closeConfirmDeleteRef.current?.();
	};

	return {
		modalContent: (
			<LoginMethodUnlinkConfirmation
				loginMethod={loginMethod}
				onConfirmed={onConfirmedUnlink}
			/>
		),
		header: <h2>Unlink login method?</h2>,
		closeCallbackRef: closeConfirmDeleteRef,
	} as LayoutModalProps;
};

export const getDeleteUserToast = (isSuccessfull: boolean) => {
	return {
		iconImage: getImageUrl(isSuccessfull ? "trash.svg" : "form-field-error-icon.svg"),
		toastType: "error",
		children: <>{isSuccessfull ? "User deleted successfully" : "User is not deleted"}</>,
	} as ToastNotificationProps;
};

export const getUnlinkUserToast = (isSuccessfull: boolean) => {
	return {
		iconImage: getImageUrl(isSuccessfull ? "trash.svg" : "form-field-error-icon.svg"),
		toastType: "error",
		children: <>{isSuccessfull ? "User unlinked successfully" : "User is not unlinked"}</>,
	} as ToastNotificationProps;
};

export const getUpdateUserToast = (isSuccessfull: boolean) => {
	return {
		iconImage: getImageUrl(isSuccessfull ? "checkmark.svg" : "form-field-error-icon.svg"),
		toastType: isSuccessfull ? "info" : "error",
		children: <>{isSuccessfull ? "User information updated successfully" : "Failed to update user information"}</>,
	} as ToastNotificationProps;
};

export const getSendEmailVerificationToast = (isSuccessfull: boolean) => {
	return {
		iconImage: getImageUrl(isSuccessfull ? "envelope-green.svg" : "form-field-error-icon.svg"),
		toastType: isSuccessfull ? "success" : "error",
		children: <>{isSuccessfull ? "Email Sent!" : "Email is failed to sent"}</>,
	} as ToastNotificationProps;
};

export const getInitlizeEmailVerificationRecipeTost = () => {
	return {
		iconImage: getImageUrl("form-field-error-icon.svg"),
		toastType: "error",
		children: <>{"EmailVerification feature is not enabled"}</>,
	} as ToastNotificationProps;
};

export const getEmailVerifiedToast = (isSuccessfull: boolean) => {
	return {
		iconImage: getImageUrl(isSuccessfull ? "checkmark-green.svg" : "form-field-error-icon.svg"),
		toastType: isSuccessfull ? "success" : "error",
		children: <>{isSuccessfull ? "Email set as verified!" : "Email is failed to set as verified"}</>,
	} as ToastNotificationProps;
};

export const getEmailUnVerifiedToast = (isSuccessfull: boolean) => {
	return {
		iconImage: getImageUrl(isSuccessfull ? "people-restricted.svg" : "form-field-error-icon.svg"),
		toastType: isSuccessfull ? "info" : "error",
		children: <>{isSuccessfull ? "Email set as unverified" : "Email is failed to set as unverified"}</>,
	} as ToastNotificationProps;
};

export const getUpdatePasswordToast = (isSuccessfull: boolean) => {
	return {
		iconImage: getImageUrl(isSuccessfull ? "checkmark-green.svg" : "form-field-error-icon.svg"),
		toastType: isSuccessfull ? "success" : "error",
		children: <>{isSuccessfull ? "Password updated" : "Failed to update password"}</>,
	} as ToastNotificationProps;
};

export const getUpdateEmailToast = (isSuccessfull: boolean) => {
	return {
		iconImage: getImageUrl(isSuccessfull ? "checkmark-green.svg" : "form-field-error-icon.svg"),
		toastType: isSuccessfull ? "success" : "error",
		children: <>{isSuccessfull ? "Email updated" : "Failed to update email"}</>,
	} as ToastNotificationProps;
};
