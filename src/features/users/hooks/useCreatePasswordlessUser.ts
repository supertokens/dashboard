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

import { useState } from "react";
import { PasswordlessContactMethod } from "@api/tenants/types";
import useCreateUserService, { CreatePasswordlessUserPayload } from "@api/user/create";
import { useToast } from "@shared/components/toast";
import { useUsersList } from "@features/users/hooks/useUsers";
import { Implementation } from "../../../implementation";

interface UseCreatePasswordlessUserParams {
	tenantId: string;
	authMethod: PasswordlessContactMethod | undefined;
	onSuccess?: (userId: string) => void;
}

interface CreatePasswordlessUserForm {
	email: string;
	phoneNumber: string;
	emailOrPhone: string;
}

export function useCreatePasswordlessUser({ tenantId, authMethod, onSuccess }: UseCreatePasswordlessUserParams) {
	const [isCreating, setIsCreating] = useState(false);
	const [formError, setFormError] = useState<string | undefined>(undefined);
	const [showPhoneInput, setShowPhoneInput] = useState(false);

	const { createPasswordlessUser } = useCreateUserService();
	const { showErrorToast, showSuccessToast } = useToast();
	const { invalidateQueries } = useUsersList({ tenantId });

	const clearError = () => setFormError(undefined);

	const buildPayload = (formData: CreatePasswordlessUserForm): CreatePasswordlessUserPayload | null => {
		const payload = Implementation.getInstanceOrThrow().buildPasswordlessPayload({
			authMethod,
			email: formData.email,
			phoneNumber: formData.phoneNumber,
			emailOrPhone: formData.emailOrPhone,
			setShowPhoneInput,
		});

		if (!payload) {
			const { MESSAGES } = require("@features/users/constants/createUser");
			showErrorToast(MESSAGES.NO_AUTH_METHOD);
			return null;
		}

		return payload;
	};

	const createUser = async (formData: CreatePasswordlessUserForm) => {
		setIsCreating(true);
		setFormError(undefined);

		try {
			const payload = buildPayload(formData);
			if (!payload) {
				setIsCreating(false);
				return;
			}

			await Implementation.getInstanceOrThrow().createPasswordlessUser({
				tenantId,
				payload,
				authMethod,
				emailOrPhone: formData.emailOrPhone,
				createPasswordlessUserService: createPasswordlessUser,
				showErrorToast,
				showSuccessToast,
				setFormError,
				invalidateQueries,
				onSuccess,
			});
		} catch (_) {
			const { MESSAGES } = await import("@features/users/constants/createUser");
			showErrorToast(MESSAGES.GENERIC_ERROR);
		} finally {
			setIsCreating(false);
		}
	};

	return {
		isCreating,
		formError,
		showPhoneInput,
		setShowPhoneInput,
		createUser,
		clearError,
	};
}
