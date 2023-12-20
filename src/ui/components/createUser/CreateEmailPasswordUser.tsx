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

import { useState } from "react";
import Button from "../button";
import { Dialog, DialogContent, DialogFooter } from "../dialog";
import InputField from "../inputField/InputField";
import { CreateUserDialogStepType } from "./CreateUserDialog";

type CreateEmailPasswordUserProps = {
	onCloseDialog: () => void;
	setCurrentStep: (step: CreateUserDialogStepType) => void;
};

export default function CreateEmailPasswordUser({ onCloseDialog, setCurrentStep }: CreateEmailPasswordUserProps) {
	const [email, setEmail] = useState<string | undefined>("");
	const [password, setPassword] = useState<string | undefined>("");

	const [isCreatingUser, setIsCreatingUser] = useState(false);

	function createUser() {
		setIsCreatingUser(true);
		setTimeout(() => {
			setIsCreatingUser(false);
		}, 3000);
	}

	return (
		<Dialog
			className="max-width-410"
			title="User Info"
			onCloseDialog={onCloseDialog}>
			<DialogContent className="text-small text-semi-bold">
				<div className="email-password-dialog-content-container">
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
