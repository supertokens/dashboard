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
import useCreateUserService from "@api/user/create";
import { useToast } from "@shared/components/toast";
import { useUsersList } from "@features/users/hooks/useUsers";
import { Implementation } from "../../../implementation";

interface UseCreateEmailPasswordUserParams {
	tenantId: string;
	onSuccess?: (userId: string) => void;
}

interface CreateEmailPasswordUserForm {
	email: string;
	password: string;
}

export function useCreateEmailPasswordUser({ tenantId, onSuccess }: UseCreateEmailPasswordUserParams) {
	const [isCreating, setIsCreating] = useState(false);
	const [emailError, setEmailError] = useState<string | undefined>(undefined);
	const [passwordError, setPasswordError] = useState<string | undefined>(undefined);

	const { createEmailPasswordUser } = useCreateUserService();
	const { showErrorToast, showSuccessToast } = useToast();
	const { invalidateQueries } = useUsersList({ tenantId });

	const clearErrors = () => {
		setEmailError(undefined);
		setPasswordError(undefined);
	};

	const createUser = async (formData: CreateEmailPasswordUserForm) => {
		setIsCreating(true);
		setEmailError(undefined);
		setPasswordError(undefined);

		try {
			await Implementation.getInstanceOrThrow().createEmailPasswordUser({
				tenantId,
				email: formData.email,
				password: formData.password,
				createEmailPasswordUserService: createEmailPasswordUser,
				showErrorToast,
				showSuccessToast,
				setEmailError,
				setPasswordError,
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
		emailError,
		passwordError,
		createUser,
		clearErrors,
	};
}
