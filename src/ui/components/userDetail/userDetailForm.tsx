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
import { updateUserInformation } from "../../../api/user";
import { updatePassword } from "../../../api/user/password/reset";
import { getImageUrl } from "../../../utils";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import { UserProps } from "../../pages/usersList/types";
import InputField from "../inputField/InputField";
import { LayoutModalProps } from "../layout/layoutModal";
import { PhoneNumberInput } from "../phoneNumber/PhoneNumberInput";
import { ToastNotificationProps } from "../toast/toastNotification";
import { OnSelectUserFunction } from "../usersListTable/UsersListTable";
import "./userDetailForm.scss";

type PasswordChangeCallback = (password?: string) => Promise<void>;

type UserDetailChangePasswordFormProps = {
	onPasswordChange: PasswordChangeCallback;
	userId: string;
};

type UserDetailChangeEmailFormProps = {
	onEmailChange: (success: boolean) => Promise<void>;
	userId: string;
	recipeId: "emailpassword" | "passwordless";
};

type UserDetailChangePhoneFormProps = {
	onPhoneChange: PasswordChangeCallback;
	userId: string;
};

type UserDeleteConfirmationProps = UserProps & { onConfirmed: (isConfirmed: boolean) => void };

type UserDeleteConfirmationTriggerProps = UserProps & { onDeleteCallback: OnSelectUserFunction };

export type UserDetailChangePasswordPopupProps = Omit<LayoutModalProps, "modalContent"> & {
	userId: string;
};

export type UserDetailChangeEmailPopupProps = Omit<LayoutModalProps, "modalContent"> & {
	userId: string;
	recipeId: "emailpassword" | "passwordless";
	onEmailChanged: () => Promise<void>;
};

export type UserDetailChangePhonePopupProps = Omit<LayoutModalProps, "modalContent"> & {
	userId: string;
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
		/>
	);

	return {
		...props,
		header: <h2 className="user-detail-form__header">Change Email</h2>,
		modalContent: modalContent,
		closeCallbackRef: closeModalRef,
	} as LayoutModalProps;
};

export const getUserChangePhonePopupProps = (props: UserDetailChangePhonePopupProps) => {
	const closeModalRef: React.MutableRefObject<(() => void) | undefined> = { current: undefined };

	const onModalClose = async (password?: string) => {
		if (closeModalRef.current !== undefined) {
			closeModalRef.current();
		}
	};

	const modalContent = (
		<UserDetailChangePhoneForm
			onPhoneChange={onModalClose}
			userId={props.userId}
		/>
	);

	return {
		...props,
		header: <h2 className="user-detail-form__header">Change Phone Number</h2>,
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
		/>
	);

	return {
		...props,
		header: <h2 className="user-detail-form__header">Change Password</h2>,
		modalContent: modalContent,
		closeCallbackRef: closeModalRef,
	} as LayoutModalProps;
};

export const UserDetailChangePhoneForm: FC<UserDetailChangePhoneFormProps> = (
	props: UserDetailChangePhoneFormProps
) => {
	const { onPhoneChange, userId } = props;
	const [phone, setPhone] = useState<string>();
	const [repeatPhone, setRepeatPhone] = useState<string>();
	const [apiError, setApiError] = useState<string | undefined>(undefined);
	const { showToast } = useContext(PopupContentContext);

	const isPhoneMatch = phone === repeatPhone;

	const onSave = async () => {
		if (phone === undefined) {
			return;
		}

		const response = await updateUserInformation({
			userId,
			phone,
			recipeId: "passwordless",
		});

		if (response.status === "INVALID_EMAIL_ERROR") {
			setApiError(response.error);
		} else if (response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
			setApiError("A user with this phone already exists");
		} else {
			showToast(getUpdatePasswordToast(true));
			await onPhoneChange();
		}
	};

	const onCancel = async () => {
		setPhone(undefined);
		setRepeatPhone(undefined);
		await onPhoneChange();
	};

	return (
		<>
			<div className="user-detail-form">
				<label
					htmlFor={"Phone Number"}
					className="text-small input-label">
					{"Phone number"}
					<span className="text-error input-label-required">*</span>
					{":"}
				</label>
				<PhoneNumberInput
					name="phone"
					value={phone}
					error={apiError}
					isRequired={true}
					onChange={(phoneNumber) => {
						setPhone(phoneNumber);
					}}
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

export const UserDetailChangeEmailForm: FC<UserDetailChangeEmailFormProps> = (
	props: UserDetailChangeEmailFormProps
) => {
	const { onEmailChange, userId, recipeId } = props;
	const [email, setEmail] = useState<string>();
	const [repeatEmail, setRepeatEmail] = useState<string>();
	const [apiError, setApiError] = useState<string | undefined>(undefined);
	const { showToast } = useContext(PopupContentContext);

	const isEmailMatch = email === repeatEmail;

	const onSave = async () => {
		if (email === undefined) {
			return;
		}

		const response = await updateUserInformation({
			userId,
			email,
			recipeId,
		});

		if (response.status === "INVALID_EMAIL_ERROR") {
			setApiError(response.error);
		} else if (response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
			setApiError("A user with this email already exists");
		} else {
			showToast(getUpdateEmailToast(true));
			await onEmailChange(true);
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
					label="New Password"
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
	const [inputValue, setInputValue] = useState<string>("");
	const [showError, shouldShowError] = useState(false);

	let informationToEnter = "Confirm";
	let inputType = "following information";

	if (user.user.email !== undefined) {
		informationToEnter = user.user.email;
		inputType = "user's email id";
	}

	if (user.recipeId === "passwordless" && user.user.phoneNumber !== undefined) {
		informationToEnter = user.user.phoneNumber;
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
			<p>
				To delete the user, please confirm by typing the {inputType}: <span>{informationToEnter}</span> below
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
					Delete Forever
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

export const getUpdateEmailToast = (isSuccessfull: boolean) => {
	return {
		iconImage: getImageUrl(isSuccessfull ? "checkmark-green.svg" : "form-field-error-icon.svg"),
		toastType: isSuccessfull ? "success" : "error",
		children: <>{isSuccessfull ? "Email updated" : "Failed to update email"}</>,
	} as ToastNotificationProps;
};
