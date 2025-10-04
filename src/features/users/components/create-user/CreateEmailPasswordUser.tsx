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

import { CreateUserDialogStepType } from "./CreateUserModal";
import { useCreateEmailPasswordUser } from "@features/users/hooks/useCreateEmailPasswordUser";
import { useTenants } from "@features/tenants/hooks/useTenants";
import { useNavigationHelpers } from "@shared/navigation";

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import TextField from "@shared/components/text";
import Label from "@shared/components/label";
import Button from "@shared/components/button";
import Paper from "@shared/components/paper";

import { Flex } from "@radix-ui/themes";

interface CreateEmailPasswordUserState {
	email: string;
	password: string;
}

interface CreateEmailPasswordUserProps {
	onCloseDialog: () => void;
	setCurrentStep: (step: CreateUserDialogStepType) => void;
}

export default function CreateEmailPasswordUser({ onCloseDialog, setCurrentStep }: CreateEmailPasswordUserProps) {
	const [formState, setFormState] = useState<CreateEmailPasswordUserState>({
		email: "",
		password: "",
	});

	const { selectedTenant } = useTenants();
	const { goToUserDetail } = useNavigationHelpers();

	const { isCreating, emailError, passwordError, createUser, clearErrors } = useCreateEmailPasswordUser({
		tenantId: selectedTenant || "",
		onSuccess: (userId) => {
			goToUserDetail(userId);
		},
	});

	const updateFormState = (updates: Partial<CreateEmailPasswordUserState>) => {
		setFormState((prev) => ({ ...prev, ...updates }));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement | HTMLButtonElement>) => {
		e.preventDefault();
		await createUser(formState);
	};

	useEffect(() => {
		clearErrors();
	}, [formState.email, formState.password, clearErrors]);

	return (
		<Modal
			title="Create User"
			handleClose={onCloseDialog}
			open={true}>
			<Paper withBackground>
				<Form>
					<Form.Item>
						<Label
							title="Email"
							htmlFor="email"
						/>
						<TextField
							value={formState.email}
							onChange={(e) => updateFormState({ email: e.currentTarget.value })}
							error={emailError}
						/>
					</Form.Item>
					<Form.Item>
						<Label
							title="Password"
							htmlFor="password"
						/>
						<TextField
							value={formState.password}
							onChange={(e) => updateFormState({ password: e.currentTarget.value })}
							type="password"
							error={passwordError}
						/>
					</Form.Item>
				</Form>
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
