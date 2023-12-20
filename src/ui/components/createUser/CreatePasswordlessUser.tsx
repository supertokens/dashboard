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
import { PasswordlessContactMethod } from "../../../api/tenants/list";
import Button from "../button";
import { Dialog, DialogContent, DialogFooter } from "../dialog";
import InputField from "../inputField/InputField";
import { CreateUserDialogStepType } from "./CreateUserDialog";

type CreatePasswordlessUserProps = {
	authMethod: PasswordlessContactMethod | undefined;
	onCloseDialog: () => void;
	setCurrentStep: (step: CreateUserDialogStepType) => void;
};

export default function CreatePasswordlessUser({ onCloseDialog, setCurrentStep }: CreatePasswordlessUserProps) {
	const [email, setEmail] = useState("");

	return (
		<Dialog
			className="max-width-410"
			title="User Info"
			onCloseDialog={onCloseDialog}>
			<DialogContent className="text-small text-semi-bold">
				<div className="dialog-form-content-container">
					<InputField
						label="Email Or Phone"
						hideColon
						value={email}
						handleChange={(e) => setEmail(e.currentTarget.value)}
						name="email"
						type="email"
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
					<Button>Next</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
