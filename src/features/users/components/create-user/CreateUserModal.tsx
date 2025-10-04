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

import CreatePasswordlessUser from "@features/users/components/create-user/CreatePasswordlessUser";
import CreateEmailPasswordUser from "@features/users/components/create-user/CreateEmailPasswordUser";
import SelectAuthMethodAndTenant from "@features/users/components/create-user/SelectAuthMethodAndTenant";

import { assertNever } from "@shared/utils/assertNever";

export type CreateUserDialogStepType =
	| "select-auth-method-and-tenant"
	| "create-email-password-user"
	| "create-passwordless-user";

interface CreateUserModalProps {
	readonly handleClose: () => void;
}

export function CreateUserModal({ handleClose }: CreateUserModalProps) {
	const [currentStep, setCurrentStep] = useState<CreateUserDialogStepType>("select-auth-method-and-tenant");
	const [selectedAuthMethod, setSelectedAuthMethod] = useState<string | undefined>(undefined);

	switch (currentStep) {
		case "select-auth-method-and-tenant": {
			return (
				<SelectAuthMethodAndTenant
					selectedAuthMethod={selectedAuthMethod}
					onAuthMethodChange={setSelectedAuthMethod}
					onNext={setCurrentStep}
					onClose={handleClose}
				/>
			);
		}

		case "create-passwordless-user": {
			return (
				<CreatePasswordlessUser
					setCurrentStep={setCurrentStep}
					onCloseDialog={handleClose}
				/>
			);
		}

		case "create-email-password-user":
			return (
				<CreateEmailPasswordUser
					setCurrentStep={setCurrentStep}
					onCloseDialog={handleClose}
				/>
			);

		default:
			return assertNever(currentStep);
	}
}
