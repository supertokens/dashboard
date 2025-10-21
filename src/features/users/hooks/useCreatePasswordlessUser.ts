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
import { MESSAGES, STATUS } from "@features/users/constants/createUser";

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
		const payload: CreatePasswordlessUserPayload = {};

		if (authMethod === "EMAIL") {
			payload.email = formData.email;
		} else if (authMethod === "PHONE") {
			payload.phoneNumber = formData.phoneNumber;
		} else if (authMethod === "EMAIL_OR_PHONE") {
			if (isPhoneNumber(formData.emailOrPhone)) {
				const normalizedPhone = normalizePhoneNumber(formData.emailOrPhone);
				payload.phoneNumber = normalizedPhone;
				setShowPhoneInput(true);
			} else {
				payload.email = formData.emailOrPhone;
			}
		} else {
			showErrorToast(MESSAGES.NO_AUTH_METHOD);
			return null;
		}

		return payload;
	};

	const getExistingUserErrorMessage = (emailOrPhone?: string): string => {
		if (authMethod === "EMAIL") {
			return MESSAGES.EMAIL_ALREADY_EXISTS;
		} else if (authMethod === "PHONE") {
			return MESSAGES.PHONE_ALREADY_EXISTS;
		} else {
			return emailOrPhone && isPhoneNumber(emailOrPhone)
				? MESSAGES.PHONE_ALREADY_EXISTS
				: MESSAGES.EMAIL_ALREADY_EXISTS;
		}
	};

	const handleValidationError = (response: { status: string; message: string }, emailOrPhone?: string): void => {
		if (
			authMethod === "EMAIL_OR_PHONE" &&
			response.status === STATUS.EMAIL_VALIDATION_ERROR &&
			emailOrPhone &&
			!isPhoneNumber(emailOrPhone)
		) {
			setFormError(MESSAGES.INVALID_EMAIL_OR_PHONE);
		} else {
			setFormError(response.message);
		}
	};

	const createUser = async (formData: CreatePasswordlessUserForm) => {
		setIsCreating(true);
		setFormError(undefined);

		try {
			const payload = buildPayload(formData);
			if (!payload) {
				return;
			}

			const response = await createPasswordlessUser(tenantId, payload);

			// Handle validation errors
			if (
				response.status === STATUS.EMAIL_VALIDATION_ERROR ||
				response.status === STATUS.PHONE_VALIDATION_ERROR
			) {
				handleValidationError(response, formData.emailOrPhone);
				return;
			}

			// Handle feature not enabled error
			if (response.status === STATUS.FEATURE_NOT_ENABLED_ERROR) {
				showErrorToast(MESSAGES.FEATURE_NOT_ENABLED);
				return;
			}

			// Handle successful response
			if (response.status === STATUS.OK) {
				if (response.createdNewRecipeUser === false) {
					showErrorToast(getExistingUserErrorMessage(formData.emailOrPhone));
				} else {
					showSuccessToast(MESSAGES.SUCCESS);
					await invalidateQueries();
					onSuccess?.(response.user.id);
				}
			}
		} catch (_) {
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

// Utility functions
function isPhoneNumber(value: string): boolean {
	const trimmedString = value.replaceAll(/\s/g, "").trim();

	// added this check since parsing a empty string to a number returns 0.
	if (trimmedString.length < 1) {
		return false;
	}

	return !isNaN(Number(trimmedString));
}

function normalizePhoneNumber(phoneNumber: string): string {
	return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
}
