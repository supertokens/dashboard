/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
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
import { PasswordlessContactMethod, Tenant } from "../../../api/tenants/types";
import { FactorIds } from "../../../constants";
import { doesTenantHasPasswordlessEnabled } from "../../../utils";
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
	defaultSelectedTenantId,
	tenants,
	loadCount,
}: {
	onCloseDialog: () => void;
	tenants: Tenant[];
	defaultSelectedTenantId: string;
	loadCount: () => void;
}) {
	const [currentStep, setCurrentStep] = useState<CreateUserDialogStepType>("select-auth-method-and-tenant");
	const [selectedTenantId, setSelectedTenantId] = useState(defaultSelectedTenantId);
	const [selectedAuthMethod, setSelectedAuthMethod] = useState<AuthMethod | undefined>(undefined);

	const selectedTenantObject = tenants.find((tenant) => tenant.tenantId === selectedTenantId)!;

	const selectableAuthMethods: { name: string; value: string }[] = [];

	if (selectedTenantObject.firstFactors.includes(FactorIds.EMAILPASSWORD)) {
		selectableAuthMethods.push({
			name: "emailpassword",
			value: "emailpassword",
		});
	}

	if (doesTenantHasPasswordlessEnabled(selectedTenantObject.firstFactors)) {
		selectableAuthMethods.push({
			name: "passwordless",
			value: "passwordless",
		});
	}

	function renderAlertMessage() {
		if (selectedAuthMethod === "passwordless") {
			return (
				<Alert
					padding="sm"
					title="Warning"
					type="primary">
					Custom API overrides for the <code>consumeCodePOST</code> API won't run as the API to create a user
					via the dashboard is different. However, custom functions override for <code>consumeCode</code> will
					run.
				</Alert>
			);
		}

		if (selectedAuthMethod === "emailpassword") {
			return (
				<Alert
					padding="sm"
					title="Warning"
					type="primary">
					<ul>
						<li>
							Custom API overrides for the sign up post API won't be run as the API to create a user via
							the dashboard is different. However, custom functions override for sign up will run.
						</li>{" "}
						<li>
							If you have custom form fields in your sign up form, those will not be included when adding
							a user via the dashboard. If you want to include any custom form fields in the request,
							please call the{" "}
							<a
								href="https://app.swaggerhub.com/apis/supertokens/FDI/#/EmailPassword%20Recipe/signUp"
								target="_blank"
								rel="noreferrer">
								sign up API manually
							</a>{" "}
							instead.
						</li>
					</ul>
				</Alert>
			);
		}

		return null;
	}

	if (currentStep === "create-passwordless-user") {
		const pwlessEmailEnabled =
			selectedTenantObject.firstFactors.includes(FactorIds.OTP_EMAIL) ||
			selectedTenantObject.firstFactors.includes(FactorIds.LINK_EMAIL);
		const pwlessPhoneEnabled =
			selectedTenantObject.firstFactors.includes(FactorIds.OTP_PHONE) ||
			selectedTenantObject.firstFactors.includes(FactorIds.LINK_PHONE);
		let contactMethod: PasswordlessContactMethod | undefined = undefined;

		if (pwlessEmailEnabled) {
			contactMethod = pwlessPhoneEnabled ? "EMAIL_OR_PHONE" : "EMAIL";
		} else if (pwlessPhoneEnabled) {
			contactMethod = "PHONE";
		}

		return (
			<CreatePasswordlessUser
				loadCount={loadCount}
				tenantId={selectedTenantId}
				authMethod={contactMethod}
				setCurrentStep={setCurrentStep}
				onCloseDialog={onCloseDialog}
			/>
		);
	}

	if (currentStep === "create-email-password-user") {
		return (
			<CreateEmailPasswordUser
				loadCount={loadCount}
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
					{renderAlertMessage()}
					<div className="select-container mb-12">
						<p className="text-label">
							Selected Tenant:{" "}
							{tenants.length === 1 ? (
								<span className="text-black ">{defaultSelectedTenantId}</span>
							) : null}
						</p>{" "}
						{tenants.length > 1 ? (
							<Select
								onOptionSelect={(value) => {
									setSelectedTenantId(value);
									setSelectedAuthMethod(undefined);
								}}
								options={tenants.map((tenant) => {
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
									Please configure passwordless or the emailpassword recipe on the backend SDK and
									this tenant. Refer to the{" "}
									<a
										className="text-error"
										target="_blank"
										rel="noreferrer"
										href="https://supertokens.com/docs/guides">
										docs
									</a>{" "}
									for detailed instructions.
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
