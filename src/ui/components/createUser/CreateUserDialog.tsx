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

import "./createUserDialog.scss";

import { useState } from "react";
import { Tenant } from "../../../api/tenants/list";
import CreateEmailPasswordUser from "./CreateEmailPasswordUser";
import CreatePasswordlessUser from "./CreatePasswordlessUser";
import SelectTenantAndAuthMethod from "./SelectTenantAndAuthMethod";

export type CreateUserDialogStepType =
	| "select-auth-method-and-tenant"
	| "create-email-password-user"
	| "create-passwordless-user";

export default function CreateUserDialog({
	onCloseDialog,
	currentSelectedTenantId,
	tenantsList,
}: {
	onCloseDialog: () => void;
	tenantsList: Tenant[];
	currentSelectedTenantId: string;
}) {
	const [currentStep, setCurrentStep] = useState<CreateUserDialogStepType>("create-email-password-user");

	switch (currentStep) {
		case "select-auth-method-and-tenant":
			return (
				//  TODO: add no auth methods initlized error on frontend...
				<SelectTenantAndAuthMethod
					currentSelectedTenantId={currentSelectedTenantId}
					onCloseDialog={onCloseDialog}
					tenantsList={tenantsList}
					setCurrentStep={setCurrentStep}
				/>
			);
		case "create-email-password-user":
			return (
				<CreateEmailPasswordUser
					setCurrentStep={setCurrentStep}
					onCloseDialog={onCloseDialog}
				/>
			);
		case "create-passwordless-user":
			return (
				<CreatePasswordlessUser
					setCurrentStep={setCurrentStep}
					onCloseDialog={onCloseDialog}
				/>
			);
		default:
			return (
				<SelectTenantAndAuthMethod
					currentSelectedTenantId={currentSelectedTenantId}
					onCloseDialog={onCloseDialog}
					tenantsList={tenantsList}
					setCurrentStep={setCurrentStep}
				/>
			);
	}
}
