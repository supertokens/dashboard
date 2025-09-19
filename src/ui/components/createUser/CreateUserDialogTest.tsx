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

import { PasswordlessContactMethod, Tenant } from "@api/tenants/types";

import Button from "@components/radix/button";
import Callout from "@components/radix/callout";
import Form from "@components/radix/form";
import Label from "@components/radix/label";
import { Modal } from "@components/radix/modal";
import Paper from "@components/radix/paper";
import Select from "@components/radix/select";
import { FactorIds } from "@constants";
import { useTenantsListContext } from "@contexts/TenantsListContext";
import { Flex } from "@radix-ui/themes";
import { assertNever } from "@utils/assertNever";
import { doesTenantHavePasswordlessEnabled } from "@utils/index";
import { useState } from "react";
import CreatePasswordlessUser from "./CreatePasswordlessUserTest";
import CreateEmailPasswordUser from "./CreateEmailPasswordUser";

type CreateUserDialogTestProps = {
	handleClose: () => void;
	tenants: Tenant[];
	loadCount: () => void;
};

export type CreateUserDialogStepType =
	| "select-auth-method-and-tenant"
	| "create-email-password-user"
	| "create-passwordless-user";

export type AuthMethod = "emailpassword" | "passwordless";

function renderAlertMessage(selectedAuthMethod: AuthMethod | undefined) {
	switch (selectedAuthMethod) {
		case "passwordless":
			return (
				<Callout type="warning">
					Custom API overrides for the <code>consumeCodePOST</code> API won't run as the API to create a user
					via the dashboard is different. However, custom functions override for <code>consumeCode</code> will
					run.
				</Callout>
			);
		case "emailpassword":
			return (
				<Callout type="warning">
					<ul>
						<li>
							Custom API overrides for the sign up post API won't be run as the API to create a user via
							the dashboard is different. However, custom functions override for sign up will run.
						</li>
					</ul>
				</Callout>
			);
		default:
			return null;
	}
}

const getSelectableAuthMethods = (selectedTenantObject: Tenant | undefined) => {
	const selectableAuthMethods: { name: string; value: string }[] = [];
	if (!selectedTenantObject) return selectableAuthMethods;
	if (selectedTenantObject.firstFactors.includes(FactorIds.EMAILPASSWORD)) {
		selectableAuthMethods.push({
			name: "emailpassword",
			value: "emailpassword",
		});
	}

	if (doesTenantHavePasswordlessEnabled(selectedTenantObject.firstFactors)) {
		selectableAuthMethods.push({
			name: "passwordless",
			value: "passwordless",
		});
	}
	return selectableAuthMethods;
};

export default function CreateUserDialogModal({ handleClose, tenants, loadCount }: CreateUserDialogTestProps) {
	const [currentStep, setCurrentStep] = useState<CreateUserDialogStepType>("select-auth-method-and-tenant");
	const [selectedTenantId, setSelectedTenantId] = useState(useTenantsListContext().getSelectedTenant());
	const [selectedAuthMethod, setSelectedAuthMethod] = useState<AuthMethod | undefined>(undefined);

	const selectedTenantObject = tenants.find((tenant) => tenant.tenantId === selectedTenantId);
	const selectableAuthMethods = getSelectableAuthMethods(selectedTenantObject);

	switch (currentStep) {
		case "select-auth-method-and-tenant": {
			const isNextStepDisabled = !selectedAuthMethod || !selectedTenantId;
			return (
				<Modal
					open={true}
					handleClose={handleClose}
					size="md"
					title="Create New User">
					<Paper withBackground>
						<Form>
							{renderAlertMessage(selectedAuthMethod)}
							<Form.Item>
								<Label
									title="Select Tenant"
									htmlFor="tenant"
								/>
								<Select
									items={tenants.map((tenant) => ({
										value: tenant.tenantId,
										label: tenant.tenantId,
									}))}
									selectedValue={selectedTenantId || ""}
									onValueChange={(value) => {
										setSelectedTenantId(value);
										setSelectedAuthMethod(undefined);
									}}
								/>
							</Form.Item>
							<Form.Item>
								<Label
									title="Select Auth Method"
									htmlFor="auth-method"
								/>
								<Select
									items={selectableAuthMethods.map((authMethod) => ({
										value: authMethod.value,
										label: authMethod.name,
									}))}
									selectedValue={selectedAuthMethod || ""}
									onValueChange={(value) => setSelectedAuthMethod(value as AuthMethod)}
								/>
							</Form.Item>
						</Form>
					</Paper>
					<Flex justify="end">
						<Button
							mt="5"
							size="3"
							disabled={isNextStepDisabled}
							onClick={() => {
								if (isNextStepDisabled) return;
								setCurrentStep(
									selectedAuthMethod === "emailpassword"
										? "create-email-password-user"
										: "create-passwordless-user"
								);
							}}>
							Save
						</Button>
					</Flex>
				</Modal>
			);
		}

		case "create-passwordless-user": {
			if (currentStep === "create-passwordless-user") {
				const pwlessEmailEnabled =
					selectedTenantObject?.firstFactors.includes(FactorIds.OTP_EMAIL) ||
					selectedTenantObject?.firstFactors.includes(FactorIds.LINK_EMAIL);
				const pwlessPhoneEnabled =
					selectedTenantObject?.firstFactors.includes(FactorIds.OTP_PHONE) ||
					selectedTenantObject?.firstFactors.includes(FactorIds.LINK_PHONE);
				let contactMethod: PasswordlessContactMethod | undefined = undefined;

				if (pwlessEmailEnabled) {
					contactMethod = pwlessPhoneEnabled ? "EMAIL_OR_PHONE" : "EMAIL";
				} else if (pwlessPhoneEnabled) {
					contactMethod = "PHONE";
				}

				return (
					<CreatePasswordlessUser
						loadCount={loadCount}
						tenantId={selectedTenantId || ""}
						authMethod={contactMethod}
						setCurrentStep={setCurrentStep}
						onCloseDialog={handleClose}
					/>
				);
			}
			return null;
		}

		case "create-email-password-user":
			return (
				<CreateEmailPasswordUser
					loadCount={loadCount}
					tenantId={selectedTenantId || ""}
					setCurrentStep={setCurrentStep}
					onCloseDialog={handleClose}
				/>
			);

		default:
			return assertNever(currentStep);
	}
}
