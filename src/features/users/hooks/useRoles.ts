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

import { useUserRolesService } from "@api/userroles/user/roles";

const QUERY_KEY = "user-roles";
const STALE_TIME = 30 * 1000; // 30 seconds

export const queryKeys = {
	roles: (userId: string, tenantId: string) => [QUERY_KEY, userId, tenantId] as const,
};

export const useRoles = (userId: string, tenantId?: string) => {
	const queryClient = useQueryClient();
	const { getRolesForUser, addRoleToUser, removeUserRole } = useUserRolesService();

	const rolesQuery = useQuery({
		queryKey: queryKeys.roles(userId, tenantId || ""),
		queryFn: () => getRolesForUser(userId, tenantId || "public"),
		staleTime: STALE_TIME,
		enabled: !!userId && !!tenantId,
		retry: false,
	});

	const addRoleMutation = useMutation({
		mutationFn: (data: { userId: string; role: string; tenantId: string }) =>
			addRoleToUser(data.userId, data.role, data.tenantId),
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.roles(userId, variables.tenantId) });
		},
	});

	const removeRoleMutation = useMutation({
		mutationFn: (data: { userId: string; role: string; tenantId: string }) =>
			removeUserRole(data.userId, data.role, data.tenantId),
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.roles(userId, variables.tenantId) });
		},
	});

	return {
		roles: rolesQuery.data,
		isLoading: rolesQuery.isLoading,
		error: rolesQuery.error,
		refetch: rolesQuery.refetch,
		addRole: addRoleMutation.mutateAsync,
		removeRole: removeRoleMutation.mutateAsync,
		isAddingRole: addRoleMutation.isPending,
		isRemovingRole: removeRoleMutation.isPending,
	};
};
