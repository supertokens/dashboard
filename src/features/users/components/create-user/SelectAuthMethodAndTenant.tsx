/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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

import { useCallback } from "react";
import { Flex } from "@radix-ui/themes";

import { Tenant } from "@api/tenants/types";
import { FactorIds } from "@shared/constants";
import { doesTenantHavePasswordlessEnabled } from "@shared/utils";
import { useTenants } from "@features/tenants/hooks/useTenants";
import { CreateUserDialogStepType } from "./CreateUserModal";

import Callout from "@shared/components/callout";
import { Modal } from "@shared/components/modal";
import Paper from "@shared/components/paper";
import Form from "@shared/components/form";
import Label from "@shared/components/label";
import Select from "@shared/components/select";
import Button from "@shared/components/button";

type AuthMethod = "emailpassword" | "passwordless";

interface SelectAuthMethodAndTenantProps {
	selectedAuthMethod: string | undefined;
	onAuthMethodChange: (value: string | undefined) => void;
	onNext: (step: CreateUserDialogStepType) => void;
	onClose: () => void;
}

const renderAlertMessage = (selectedAuthMethod: AuthMethod | undefined) => {
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
};

const getSelectableAuthMethods = (selectedTenantObject: Tenant | undefined) => {
	if (!selectedTenantObject) return [];

	const authMethods: Array<{ name: string; value: AuthMethod }> = [];

	if (selectedTenantObject.firstFactors.includes(FactorIds.EMAILPASSWORD)) {
		authMethods.push({
			name: "Email Password",
			value: "emailpassword",
		});
	}

	if (doesTenantHavePasswordlessEnabled(selectedTenantObject.firstFactors)) {
		authMethods.push({
			name: "Passwordless",
			value: "passwordless",
		});
	}

	return authMethods;
};

export default function SelectAuthMethodAndTenant({
	selectedAuthMethod,
	onAuthMethodChange,
	onNext,
	onClose,
}: SelectAuthMethodAndTenantProps) {
	const { selectedTenant, setSelectedTenant, tenants } = useTenants();

	const selectedTenantObject = tenants?.find((tenant) => tenant.tenantId === selectedTenant);
	const selectableAuthMethods = getSelectableAuthMethods(selectedTenantObject);

	const handleTenantChange = useCallback(
		(value: string) => {
			setSelectedTenant(value);
			onAuthMethodChange(undefined);
		},
		[setSelectedTenant, onAuthMethodChange]
	);

	const handleAuthMethodChange = useCallback(
		(value: string) => {
			onAuthMethodChange(value);
		},
		[onAuthMethodChange]
	);

	const handleNext = useCallback(() => {
		if (!selectedAuthMethod) return;

		const nextStep: CreateUserDialogStepType =
			selectedAuthMethod === "emailpassword" ? "create-email-password-user" : "create-passwordless-user";

		onNext(nextStep);
	}, [selectedAuthMethod, onNext]);
	const isNextStepDisabled = !selectedAuthMethod || !selectedTenant;
	const tenantOptions =
		tenants?.map((tenant) => ({
			value: tenant.tenantId,
			label: tenant.tenantId,
		})) || [];
	const authMethodOptions = selectableAuthMethods.map((authMethod) => ({
		value: authMethod.value,
		label: authMethod.name,
	}));

	return (
		<Modal
			open={true}
			handleClose={onClose}
			size="md"
			title="Create New User">
			<Paper withBackground>
				<Form>
					{renderAlertMessage(selectedAuthMethod as AuthMethod | undefined)}
					<Form.Item>
						<Label
							title="Select Tenant"
							htmlFor="tenant"
						/>
						<Select
							items={tenantOptions}
							selectedValue={selectedTenant || ""}
							onValueChange={handleTenantChange}
						/>
					</Form.Item>
					<Form.Item>
						<Label
							title="Select Auth Method"
							htmlFor="auth-method"
						/>
						<Select
							items={authMethodOptions}
							selectedValue={selectedAuthMethod || ""}
							onValueChange={handleAuthMethodChange}
						/>
						{authMethodOptions.length === 0 && selectedTenant && (
							<Callout
								type="error"
								mt="4">
								No authentication methods are configured for this tenant. Please configure passwordless
								or email-password authentication in your backend.
							</Callout>
						)}
					</Form.Item>
				</Form>
			</Paper>
			<Flex justify="end">
				<Button
					mt="5"
					size="3"
					disabled={isNextStepDisabled}
					onClick={handleNext}>
					Next
				</Button>
			</Flex>
		</Modal>
	);
}
