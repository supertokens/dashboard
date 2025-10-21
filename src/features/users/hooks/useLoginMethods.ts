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

import { useMutation, useQueryClient } from "@tanstack/react-query";

import useUserService, { type IUpdateUserInformationArgs } from "@api/user";
import usePasswordResetService from "@api/user/password/reset";
import useVerifyUserEmail from "@api/user/email/verify";
import useVerifyUserTokenService from "@api/user/email/verify/token";
import useDeleteUserService from "@api/user/delete";
import useUnlinkService from "@api/user/unlink";

import { queryKeys as userQueryKeys } from "./useUser";

export const useLoginMethods = (userId: string) => {
	const queryClient = useQueryClient();

	const { updateUserInformation } = useUserService();
	const { updatePassword } = usePasswordResetService();
	const { getUserEmailVerificationStatus, updateUserEmailVerificationStatus } = useVerifyUserEmail();
	const { sendUserEmailVerification } = useVerifyUserTokenService();
	const { deleteUser } = useDeleteUserService();
	const { unlinkUser } = useUnlinkService();

	// Update login method (email/phone)
	const updateLoginMethodMutation = useMutation({
		mutationFn: (data: IUpdateUserInformationArgs) => updateUserInformation(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(userId) });
		},
	});

	// Change password
	const changePasswordMutation = useMutation({
		mutationFn: (data: { recipeUserId: string; newPassword: string; tenantId?: string }) =>
			updatePassword(data.recipeUserId, data.newPassword, data.tenantId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(userId) });
		},
	});

	// Send verification email
	const sendVerificationEmailMutation = useMutation({
		mutationFn: (data: { recipeUserId: string; tenantId?: string }) =>
			sendUserEmailVerification(data.recipeUserId, data.tenantId),
	});

	// Toggle email verification status
	const toggleEmailVerificationMutation = useMutation({
		mutationFn: (data: { recipeUserId: string; isVerified: boolean; tenantId?: string }) =>
			updateUserEmailVerificationStatus(data.recipeUserId, data.isVerified, data.tenantId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(userId) });
		},
	});

	// Delete login method (user)
	const deleteLoginMethodMutation = useMutation({
		mutationFn: (data: { recipeUserId: string; removeAllLinkedAccounts: boolean }) =>
			deleteUser(data.recipeUserId, data.removeAllLinkedAccounts),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(userId) });
		},
	});

	// Unlink login method
	const unlinkLoginMethodMutation = useMutation({
		mutationFn: (recipeUserId: string) => unlinkUser(recipeUserId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: userQueryKeys.user(userId) });
		},
	});

	return {
		// Mutations
		updateLoginMethod: updateLoginMethodMutation.mutateAsync,
		changePassword: changePasswordMutation.mutateAsync,
		sendVerificationEmail: sendVerificationEmailMutation.mutateAsync,
		toggleEmailVerification: toggleEmailVerificationMutation.mutateAsync,
		deleteLoginMethod: deleteLoginMethodMutation.mutateAsync,
		unlinkLoginMethod: unlinkLoginMethodMutation.mutateAsync,

		// Mutation states
		isUpdatingLoginMethod: updateLoginMethodMutation.isPending,
		isChangingPassword: changePasswordMutation.isPending,
		isSendingVerificationEmail: sendVerificationEmailMutation.isPending,
		isTogglingEmailVerification: toggleEmailVerificationMutation.isPending,
		isDeletingLoginMethod: deleteLoginMethodMutation.isPending,
		isUnlinkingLoginMethod: unlinkLoginMethodMutation.isPending,

		// Helper function to check email verification status
		getUserEmailVerificationStatus,
	};
};
