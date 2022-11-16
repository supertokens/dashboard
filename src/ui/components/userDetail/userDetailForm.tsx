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
import { updatePassword } from "../../../api/user/password/reset";
import { getImageUrl } from "../../../utils";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import { UserProps } from "../../pages/usersList/types";
import InputField from "../inputField/InputField";
import { LayoutModalProps } from "../layout/layoutModal";
import { ToastNotificationProps } from "../toast/toastNotification";
import { OnSelectUserFunction } from "../usersListTable/UsersListTable";
import "./userDetailForm.scss";
import { UserDisplayName } from "./userDetailHeader";

type PasswordChangeCallback = (password?: string) => Promise<void>;

type UserDetailChangePasswordFormProps = {
	onPasswordChange: PasswordChangeCallback;
	userId: string;
};

type UserDeleteConfirmationProps = UserProps & { onConfirmed: (isConfirmed: boolean) => void };

type UserDeleteConfirmationTriggerProps = UserProps & { onDeleteCallback: OnSelectUserFunction };

export type UserDetailChangePasswordPopupProps = Omit<LayoutModalProps, "modalContent"> & {
	userId: string;
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
		/>
	);

	return {
		...props,
		header: <h2 className="user-detail-form__header">Change Password</h2>,
		modalContent: modalContent,
		closeCallbackRef: closeModalRef,
	} as LayoutModalProps;
};

export const UserDetailChangePasswordForm: FC<UserDetailChangePasswordFormProps> = (
	props: UserDetailChangePasswordFormProps
) => {
	const { onPasswordChange, userId } = props;
	const [password, setPassword] = useState<string>();
	const [repeatPassword, setRepeatPassword] = useState<string>();
	const [apiError, setApiError] = useState<string | undefined>(undefined);
	const { showToast } = useContext(PopupContentContext);

	const isPasswordMatch = password === repeatPassword;

	const onSave = async () => {
		if (password === undefined) {
			return;
		}

		const response = await updatePassword(userId, password);

		if (response.status === "INVALID_PASSWORD_ERROR") {
			setApiError(response.error);
		} else {
			showToast(getUpdatePasswordToast(true));
			await onPasswordChange();
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
					label="Password"
					isRequired={true}
					hideColon={true}
					error={apiError}
					handleChange={({ target: { value } }) => setPassword(value)}
				/>
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

export const UserDeleteConfirmation: FC<UserDeleteConfirmationProps> = ({ user, onConfirmed }) => {
	return (
		<div className="user-detail-form">
			<p>
				Are you sure you want to delete user “
				<b>
					<UserDisplayName user={user} />
				</b>
				”?
			</p>
			<p> This action is irreversible.</p>
			<div className="user-detail-form__actions">
				<button
					className="button outline"
					onClick={() => onConfirmed(false)}>
					Cancel
				</button>
				<button
					className="button button-error"
					onClick={() => onConfirmed(true)}>
					Yes, Delete
				</button>
			</div>
		</div>
	);
};

export const getUserDeleteConfirmationProps = (props: UserDeleteConfirmationTriggerProps) => {
	const { user, onDeleteCallback } = props;
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
				user={user}
				onConfirmed={onConfirmedDelete}
			/>
		),
		header: <h2>Delete User?</h2>,
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
