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
import { Tenant } from "../../../api/tenants/login-methods";
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
	tenantsLoginMethods,
}: {
	onCloseDialog: () => void;
	tenantsLoginMethods: Tenant[];
	currentSelectedTenantId: string;
}) {
	const [currentStep, setCurrentStep] = useState<CreateUserDialogStepType>("select-auth-method-and-tenant");
	const [selectedTenantId, setSelectedTenantId] = useState(currentSelectedTenantId);
	const [selectedAuthMethod, setSelectedAuthMethod] = useState<AuthMethod | undefined>(undefined);

	const selectedTenantObject = tenantsLoginMethods.find((tenant) => tenant.tenantId === selectedTenantId)!;

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
			className="max-width-436"
			title="Create New User"
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
							{tenantsLoginMethods.length === 1 ? (
								<span className="text-black ">{currentSelectedTenantId}</span>
							) : null}
						</p>{" "}
						{tenantsLoginMethods.length > 1 ? (
							<Select
								onOptionSelect={(value) => {
									setSelectedTenantId(value);
									setSelectedAuthMethod(undefined);
								}}
								options={tenantsLoginMethods.map((tenant) => {
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
						{selectableAuthMethods.length >= 1 ? (
							<Select
								onOptionSelect={(value) => setSelectedAuthMethod(value as AuthMethod)}
								options={selectableAuthMethods}
								selectedOption={selectedAuthMethod}
							/>
						) : (
							<div className="input-field-error block-small block-error w-100">
								<p className="text-xs text-command">
									{selectedTenantId === "public" ? (
										<>
											Currently, neither the Passwordless nor EmailPassword auth methods are
											initialized in your backend SDK. Please refer{" "}
											<a
												target="_blank"
												className="text-error bg-transparent"
												rel="noreferrer"
												href="https://supertokens.com/docs/guides">
												here
											</a>{" "}
											to initialize them on your backend.
										</>
									) : (
										<>
											Currently, both the Passwordless and EmailPassword authentication methods
											are not configured for this tenant in the core or in your backend SDK.
											<ul style={{ padding: "8px 16px" }}>
												<li>
													If you haven't configured your tenant to support either of the
													mentioned authentication methods in your core above, please follow
													this{" "}
													<a
														target="_blank"
														rel="noreferrer"
														className="text-error bg-transparent"
														href="https://supertokens.com/docs/multitenancy/new-tenant#basic-tenant-creation">
														guide
													</a>{" "}
													to enable them.
												</li>
												<li style={{ marginTop: "8px" }}>
													If you have already configured these methods in your core, please
													refer{" "}
													<a
														target="_blank"
														rel="noreferrer"
														className="text-error bg-transparent"
														href="https://supertokens.com/docs/guides">
														here
													</a>{" "}
													to initialize them on your backend.
												</li>
											</ul>
										</>
									)}
								</p>
							</div>
						)}
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
