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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import useUserService from "@api/user";

import { User } from "@features/users/types";
import { Tenant } from "@api/tenants/types";

const QUERY_KEY = "user-details";
const STALE_TIME = 30 * 1000; // 30 seconds

export const queryKeys = {
	user: (userId: string) => [QUERY_KEY, userId] as const,
};

export const useUser = (userId: string) => {
	const queryClient = useQueryClient();
	const { getUser, updateUserInformation } = useUserService();

	const userQuery = useQuery({
		queryKey: queryKeys.user(userId),
		queryFn: () => getUser(userId),
		staleTime: STALE_TIME,
		retry: false,
	});

	const updateUserMutation = useMutation({
		mutationFn: (data: { userId: string; user: User; tenants: Tenant[] }) =>
			updateUserInformation({
				userId: data.userId,
				recipeId: data.user.loginMethods[0]?.recipeId || "emailpassword",
				recipeUserId: data.user.loginMethods[0]?.recipeUserId || data.userId,
				email: data.user.loginMethods[0]?.email,
				phone: data.user.loginMethods[0]?.phoneNumber,
				firstName: data.user.firstName,
				lastName: data.user.lastName,
				tenantId: data.tenants[0]?.tenantId || "public",
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
		},
	});

	return {
		userDetails: userQuery.data,
		isLoading: userQuery.isLoading,
		error: userQuery.error,
		refetch: userQuery.refetch,
		updateUser: updateUserMutation.mutateAsync,
		isUpdatingUser: updateUserMutation.isPending,
	};
};
