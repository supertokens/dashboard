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

import { FC, useCallback, useRef, useState } from "react";
import InputField from "../inputField/InputField";
import LayoutModalTrigger, { LayoutModalTriggerProps } from "../layout/layoutModal";
import "./userDetailForm.scss";

type PasswordChangeCallback = (password?: string) => void;

type UserDetailChangePasswordFormProps = {
	onPasswordChange: PasswordChangeCallback;
};

export type UserDetailChangePasswordPopupProps = Omit<LayoutModalTriggerProps, "modalContent"> & {
	onPasswordChange: PasswordChangeCallback;
};

const PASSWORD_MIN_LENGTH = 6;
const getPasswordError = (password: string) => {
	if (password.length < PASSWORD_MIN_LENGTH) {
		return `Password should have at least ${PASSWORD_MIN_LENGTH} characters`;
	}
};

export const UserDetailChangePasswordPopup: FC<UserDetailChangePasswordPopupProps> = (
	props: UserDetailChangePasswordPopupProps
) => {
	const { onPasswordChange } = props;
	const closeModalRef = useRef<Function>();

	const onModalClose = useCallback(
		(password?: string) => {
			if (closeModalRef.current !== undefined) {
				closeModalRef.current();
			}
			if (password !== undefined) {
				onPasswordChange(password);
			}
		},
		[onPasswordChange]
	);

	const modalContent = <UserDetailChangePasswordForm onPasswordChange={onModalClose} />;

	return (
		<LayoutModalTrigger
			{...props}
			header={<h2 className="user-detail-form__header">Change Password</h2>}
			modalContent={modalContent}
			closeCallbackRef={closeModalRef}
		/>
	);
};

export const UserDetailChangePasswordForm: FC<UserDetailChangePasswordFormProps> = (
	props: UserDetailChangePasswordFormProps
) => {
	const { onPasswordChange } = props;
	const [password, setPassword] = useState<string>();
	const [repeatPassword, setRepeatPassword] = useState<string>();

	const isPasswordMatch = password === repeatPassword;
	const passwordError = password !== undefined ? getPasswordError(password) : undefined;
	const isSaveDisabled = Boolean(
		password === undefined || passwordError || !isPasswordMatch || repeatPassword === undefined
	);

	return (
		<>
			<div className="user-detail-form">
				<InputField
					name="password"
					type="password"
					label="Password"
					isRequired={true}
					hideColon={true}
					error={passwordError}
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
						onClick={() => onPasswordChange()}>
						Cancel
					</button>
					<button
						className="button"
						disabled={isSaveDisabled}
						onClick={() => onPasswordChange(password)}>
						Save
					</button>
				</div>
			</div>
		</>
	);
};
