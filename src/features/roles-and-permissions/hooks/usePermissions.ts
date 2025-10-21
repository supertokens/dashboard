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

import useRolesService from "@api/userroles/role";
import { usePermissionsService } from "@api/userroles/role/permissions";
import { QUERY_KEYS, STALE_TIME } from "../constants";

const queryKeys = {
	rolePermissions: (roleId: string) => [QUERY_KEYS.ROLE_PERMISSIONS, roleId] as const,
};

export const usePermissions = (roleId: string) => {
	const queryClient = useQueryClient();
	const { createRoleOrUpdateARole } = useRolesService();
	const { getPermissionsForRole, removePermissionsFromRole } = usePermissionsService();

	const permissionsQuery = useQuery({
		queryKey: queryKeys.rolePermissions(roleId),
		queryFn: async () => {
			const response = await getPermissionsForRole(roleId);

			if (!response) {
				throw new Error("Failed to fetch permissions");
			}

			if (response.status === "OK") {
				return response.permissions;
			}

			if (response.status === "UNKNOWN_ROLE_ERROR") {
				throw new Error("Role not found");
			}

			if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
				throw new Error("Feature not enabled");
			}

			throw new Error("Failed to fetch permissions");
		},
		staleTime: STALE_TIME.ROLE_DETAILS,
		enabled: !!roleId,
		retry: false,
	});

	const addPermissionsMutation = useMutation({
		mutationFn: async (permissions: string[]) => {
			const currentPermissions = permissionsQuery.data || [];
			const allPermissions = Array.from(new Set([...currentPermissions, ...permissions]));
			return createRoleOrUpdateARole(roleId, allPermissions);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.rolePermissions(roleId) });
		},
	});

	const removePermissionsMutation = useMutation({
		mutationFn: (permissions: string[]) => removePermissionsFromRole(roleId, permissions),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.rolePermissions(roleId) });
		},
	});

	return {
		permissions: permissionsQuery.data || [],
		isLoading: permissionsQuery.isLoading,
		error: permissionsQuery.error,
		refetch: permissionsQuery.refetch,
		addPermissions: addPermissionsMutation.mutateAsync,
		removePermissions: removePermissionsMutation.mutateAsync,
		isAddingPermissions: addPermissionsMutation.isPending,
		isRemovingPermissions: removePermissionsMutation.isPending,
	};
};
