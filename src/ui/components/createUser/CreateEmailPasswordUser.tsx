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

import { useContext, useState } from "react";
import useCreateUserService from "../../../api/user/create";
import { getApiUrl, getImageUrl } from "../../../utils";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import Button from "../button";
import { Dialog, DialogContent, DialogFooter } from "../dialog";
import InputField from "../inputField/InputField";
import { CreateUserDialogStepType } from "./CreateUserDialog";

type CreateEmailPasswordUserProps = {
	tenantId: string;
	onCloseDialog: () => void;
	setCurrentStep: (step: CreateUserDialogStepType) => void;
};

export default function CreateEmailPasswordUser({
	tenantId,
	onCloseDialog,
	setCurrentStep,
}: CreateEmailPasswordUserProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isCreatingUser, setIsCreatingUser] = useState(false);

	const { createEmailPasswordUser } = useCreateUserService();
	const { showToast } = useContext(PopupContentContext);

	async function createUser() {
		setIsCreatingUser(true);

		try {
			const response = await createEmailPasswordUser(tenantId, email, password);
			if (response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>User with this email already exists in {tenantId} tenant.</>,
				});
				return;
			}
			if (response.status === "OK") {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "success",
					children: <>User created successfully!</>,
				});
				window.open(getApiUrl(`?userid=${response.user.id}`), "_blank");
			}
		} catch (_) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong, please try again!</>,
			});
		} finally {
			setIsCreatingUser(false);
		}
	}

	return (
		<Dialog
			className="max-width-410"
			title="User Info"
			onCloseDialog={onCloseDialog}>
			<DialogContent className="text-small text-semi-bold">
				<div className="dialog-form-content-container">
					<InputField
						label="Email"
						hideColon
						value={email}
						handleChange={(e) => setEmail(e.currentTarget.value)}
						name="email"
						type="email"
					/>
					<InputField
						label="Password"
						hideColon
						value={password}
						handleChange={(e) => setPassword(e.currentTarget.value)}
						name="password"
						type="password"
					/>
				</div>
				<DialogFooter border="border-top">
					<Button
						color="gray-outline"
						onClick={() => {
							setCurrentStep("select-auth-method-and-tenant");
						}}>
						Go Back
					</Button>
					<Button
						onClick={createUser}
						isLoading={isCreatingUser}
						disabled={isCreatingUser}>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
