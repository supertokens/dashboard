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
import Alert from "../alert";
import Button from "../button";
import { Dialog, DialogContent, DialogFooter } from "../dialog";
import Select from "../select";
import CreateEmailPasswordUser from "./CreateEmailPasswordUser";
import CreatePasswordlessUser from "./CreatePasswordlessUser";

export type AuthMethod = "emailpassword" | "passwordless";

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
	const [currentStep, setCurrentStep] = useState<CreateUserDialogStepType>("select-auth-method-and-tenant");
	const [selectedTenantId, setSelectedTenantId] = useState(currentSelectedTenantId);
	const [selectedAuthMethod, setSelectedAuthMethod] = useState<AuthMethod | undefined>(undefined);

	const selectedTenantObject = tenantsList.find((tenant) => tenant.tenantId === selectedTenantId)!;

	function getSelectableAuthMethods() {
		const selectableAuthMethods: { name: string; value: string }[] = [];

		if (selectedTenantObject.emailPassword.enabled === true) {
			selectableAuthMethods.push({
				name: "emailpassword",
				value: "emailpassword",
			});
		}

		if (selectedTenantObject.passwordless.enabled === true) {
			selectableAuthMethods.push({
				name: "passwordless",
				value: "passwordless",
			});
		}

		return selectableAuthMethods;
	}

	if (currentStep === "create-passwordless-user" && selectedTenantObject.passwordless.contactMethod !== undefined) {
		return (
			<CreatePasswordlessUser
				tenantId={selectedTenantId}
				authMethod={selectedTenantObject.passwordless.contactMethod}
				setCurrentStep={setCurrentStep}
				onCloseDialog={onCloseDialog}
			/>
		);
	}

	if (currentStep === "create-email-password-user") {
		return (
			<CreateEmailPasswordUser
				tenantId={selectedTenantId}
				setCurrentStep={setCurrentStep}
				onCloseDialog={onCloseDialog}
			/>
		);
	}

	return (
		<Dialog
			className="max-width-410"
			title="Create New Use"
			onCloseDialog={onCloseDialog}>
			<DialogContent className="text-small text-semi-bold">
				<div className="create-user-modal-content">
					<Alert
						padding="sm"
						title="info"
						type="secondary">
						Custom overrides for the sign up recipe function on the backend will be run when a user is
						created, however, the sign up API override will not run, for more info regarding this{" "}
						<a
							rel="noreferrer"
							href="https://suppertokens.com/docs/"
							target="_blank">
							click here.
						</a>
					</Alert>
					<div className="select-container mb-12">
						<p className="text-label">
							Selected Tenant:{" "}
							{tenantsList.length === 1 ? <span className="text-black ">Public</span> : null}
						</p>{" "}
						{tenantsList.length > 1 ? (
							<Select
								onOptionSelect={(value) => {
									setSelectedTenantId(value);
									setSelectedAuthMethod(undefined);
								}}
								options={tenantsList.map((tenant) => {
									return {
										name: tenant.tenantId,
										value: tenant.tenantId,
									};
								})}
								selectedOption={selectedTenantId}
							/>
						) : null}
					</div>
					<div className="select-container mb-28">
						<span className="text-label">Select Auth Method:</span>
						<Select
							onOptionSelect={(value) => setSelectedAuthMethod(value as AuthMethod)}
							options={getSelectableAuthMethods()}
							selectedOption={selectedAuthMethod}
						/>
					</div>
				</div>
				<DialogFooter border="border-top">
					<Button
						disabled={selectedAuthMethod === undefined}
						color={selectedAuthMethod === undefined ? "gray" : "primary"}
						onClick={() => {
							if (selectedAuthMethod === "emailpassword") {
								setCurrentStep("create-email-password-user");
							} else if (selectedAuthMethod === "passwordless") {
								setCurrentStep("create-passwordless-user");
							} else {
								alert("Please select a auth method to continue");
							}
						}}>
						Next
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
