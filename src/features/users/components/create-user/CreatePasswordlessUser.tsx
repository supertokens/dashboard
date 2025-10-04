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

import { useEffect, useState } from "react";

import { PasswordlessContactMethod } from "@api/tenants/types";
import { useCreatePasswordlessUser } from "@features/users/hooks/useCreatePasswordlessUser";
import { CreateUserDialogStepType } from "./CreateUserModal";
import { assertNever } from "@utils/assertNever";
import { useNavigationHelpers } from "@shared/navigation";
import { useTenants } from "@features/tenants/hooks/useTenants";
import { FactorIds } from "@shared/constants";

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import Label from "@shared/components/label";
import TextField from "@shared/components/text";
import Button from "@shared/components/button";
import PhoneNumberInput from "@shared/components/phoneNumberInput";
import Paper from "@shared/components/paper";

import { Flex } from "@radix-ui/themes";

interface CreatePasswordlessUserState {
	email: string;
	phoneNumber: string;
	emailOrPhone: string;
}

interface CreatePasswordlessUserProps {
	onCloseDialog: () => void;
	setCurrentStep: (step: CreateUserDialogStepType) => void;
}

export default function CreatePasswordlessUser({ onCloseDialog, setCurrentStep }: CreatePasswordlessUserProps) {
	const [formState, setFormState] = useState<CreatePasswordlessUserState>({
		email: "",
		phoneNumber: "",
		emailOrPhone: "",
	});

	const { goToUserDetail } = useNavigationHelpers();
	const { selectedTenant, tenants } = useTenants();

	const selectedTenantObject = tenants?.find((tenant) => tenant.tenantId === selectedTenant);
	const authMethod: PasswordlessContactMethod | undefined = (() => {
		if (!selectedTenantObject) return undefined;

		const pwlessEmailEnabled =
			selectedTenantObject.firstFactors.includes(FactorIds.OTP_EMAIL) ||
			selectedTenantObject.firstFactors.includes(FactorIds.LINK_EMAIL);
		const pwlessPhoneEnabled =
			selectedTenantObject.firstFactors.includes(FactorIds.OTP_PHONE) ||
			selectedTenantObject.firstFactors.includes(FactorIds.LINK_PHONE);

		if (pwlessEmailEnabled) {
			return pwlessPhoneEnabled ? "EMAIL_OR_PHONE" : "EMAIL";
		} else if (pwlessPhoneEnabled) {
			return "PHONE";
		}
		return undefined;
	})();

	const { isCreating, formError, showPhoneInput, createUser, clearError } = useCreatePasswordlessUser({
		tenantId: selectedTenant || "",
		authMethod,
		onSuccess: (userId) => {
			goToUserDetail(userId);
		},
	});

	const updateFormState = (updates: Partial<CreatePasswordlessUserState>) => {
		setFormState((prev) => ({ ...prev, ...updates }));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement | HTMLButtonElement>) => {
		e.preventDefault();
		await createUser(formState);
	};

	const checkUndefined = (value: string | undefined) => {
		return value !== undefined ? value : "";
	};

	useEffect(() => {
		clearError();
	}, [formState.email, formState.phoneNumber, formState.emailOrPhone, clearError]);

	const renderAuthMethodForm = () => {
		switch (authMethod) {
			case "EMAIL":
				return (
					<Form.Item>
						<Label
							title="Email"
							htmlFor="email"
						/>
						<TextField
							error={formError}
							value={formState.email}
							onChange={(e) => updateFormState({ email: e.currentTarget.value })}
							name="email"
							placeholder="Enter email address"
						/>
					</Form.Item>
				);
			case "PHONE":
				return (
					<Form.Item>
						<PhoneNumberInput
							error={formError}
							name="phone"
							onChange={(value: string | undefined) => {
								updateFormState({ phoneNumber: checkUndefined(value) });
							}}
							label="Phone Number"
							forceShowError
						/>
					</Form.Item>
				);
			case "EMAIL_OR_PHONE":
				return (
					<Form.Item>
						{showPhoneInput ? (
							<PhoneNumberInput
								error={formError}
								value={formState.emailOrPhone}
								name="phone"
								onChange={(value: string | undefined) => {
									updateFormState({ emailOrPhone: checkUndefined(value) });
								}}
								label="Phone Number"
								forceShowError
							/>
						) : (
							<Form.Item>
								<Label
									title="Email or Phone"
									htmlFor="email-or-phone"
								/>
								<TextField
									error={formError}
									value={formState.emailOrPhone}
									onChange={(e) => updateFormState({ emailOrPhone: e.currentTarget.value })}
									name="email-or-phone"
									placeholder="Enter email address or phone number"
								/>
							</Form.Item>
						)}
					</Form.Item>
				);
			case undefined:
				return null;
			default:
				return assertNever(authMethod);
		}
	};

	return (
		<Modal
			title="Create User"
			handleClose={onCloseDialog}
			open={true}>
			<Paper withBackground>
				<Form>{renderAuthMethodForm()}</Form>
			</Paper>
			<Flex
				justify="end"
				gap="4"
				mt="4">
				<Button
					onClick={() => {
						setCurrentStep("select-auth-method-and-tenant");
					}}
					type="button"
					variant="outline">
					Go Back
				</Button>
				<Button
					type="submit"
					onClick={handleSubmit}
					disabled={isCreating}>
					Create
				</Button>
			</Flex>
		</Modal>
	);
}
