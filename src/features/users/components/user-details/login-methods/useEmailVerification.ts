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

import { useState } from "react";

import { useToast } from "@shared/components/toast";

import { useLoginMethods } from "@features/users/hooks/useLoginMethods";

interface UseEmailVerificationProps {
	readonly userId: string;
	readonly recipeUserId: string;
	readonly tenantId: string;
	readonly isVerified: boolean;
}

export function useEmailVerification({ userId, recipeUserId, tenantId, isVerified }: UseEmailVerificationProps) {
	const { showSuccessToast, showErrorToast } = useToast();
	const { sendVerificationEmail, toggleEmailVerification, getUserEmailVerificationStatus } = useLoginMethods(userId);

	const [isSendingEmail, setIsSendingEmail] = useState(false);

	const handleSendVerificationEmail = async () => {
		try {
			setIsSendingEmail(true);
			const status = await getUserEmailVerificationStatus(recipeUserId);

			if (status.status === "FEATURE_NOT_ENABLED_ERROR") {
				showErrorToast("Email verification feature is not enabled");
				return;
			}

			const success = await sendVerificationEmail({
				recipeUserId,
				tenantId,
			});

			if (success) {
				showSuccessToast("Verification email sent successfully");
			} else {
				showErrorToast("Failed to send verification email");
			}
		} catch (err) {
			showErrorToast("Failed to send verification email");
		} finally {
			setIsSendingEmail(false);
		}
	};

	const handleToggleVerification = async () => {
		try {
			const status = await getUserEmailVerificationStatus(recipeUserId);

			if (status.status === "FEATURE_NOT_ENABLED_ERROR") {
				showErrorToast("Email verification feature is not enabled");
				return;
			}

			const success = await toggleEmailVerification({
				recipeUserId,
				isVerified: !isVerified,
				tenantId,
			});

			if (success) {
				showSuccessToast(`Email ${!isVerified ? "verified" : "unverified"} successfully`);
			} else {
				showErrorToast("Failed to update verification status");
			}
		} catch (err) {
			showErrorToast("Failed to update verification status");
		}
	};

	return {
		isSendingEmail,
		handleSendVerificationEmail,
		handleToggleVerification,
	};
}
