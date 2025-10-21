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

import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import useRolesService from "@api/userroles/role";
import { usePermissionsService } from "@api/userroles/role/permissions";
import { QUERY_KEYS, STALE_TIME } from "../constants";
import { Role, RoleListQueryResult } from "../types";

const queryKeys = {
	roles: () => [QUERY_KEYS.ROLES] as const,
};

export const useRolesList = () => {
	const queryClient = useQueryClient();
	const { getRoles, createRoleOrUpdateARole, deleteRole } = useRolesService();
	const { getPermissionsForRole } = usePermissionsService();

	const [searchQuery, setSearchQuery] = useState("");
	const [rolesWithPermissions, setRolesWithPermissions] = useState<Role[]>([]);

	const rolesQuery = useQuery({
		queryKey: queryKeys.roles(),
		queryFn: async (): Promise<RoleListQueryResult> => {
			const response = await getRoles();

			if (!response) {
				throw new Error("Failed to fetch roles");
			}

			if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
				return {
					roles: [],
					isFeatureEnabled: false,
				};
			}

			const rolesWithUndefinedPermissions: Role[] = response.roles.reverse().map((role) => ({
				role,
				permissions: undefined,
			}));

			return {
				roles: rolesWithUndefinedPermissions,
				isFeatureEnabled: true,
			};
		},
		staleTime: STALE_TIME.ROLES,
		retry: false,
	});

	// Update local state when roles data changes
	useEffect(() => {
		if (rolesQuery.data?.roles) {
			setRolesWithPermissions(rolesQuery.data.roles);
		}
	}, [rolesQuery.data?.roles]);

	const createRoleMutation = useMutation({
		mutationFn: (data: { role: string; permissions: string[] }) =>
			createRoleOrUpdateARole(data.role, data.permissions),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.roles() });
		},
	});

	const deleteRoleMutation = useMutation({
		mutationFn: (role: string) => deleteRole(role),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.roles() });
		},
	});

	const fetchPermissionsForRole = useCallback(
		async (roleName: string): Promise<void> => {
			try {
				const response = await getPermissionsForRole(roleName);
				if (response?.status === "OK") {
					// Update the specific role with its permissions
					setRolesWithPermissions((prevRoles) =>
						prevRoles.map((r) => (r.role === roleName ? { ...r, permissions: response.permissions } : r))
					);
				}
			} catch {
				// Silently fail - permissions will remain undefined
			}
		},
		[getPermissionsForRole]
	);

	// Auto-fetch permissions for roles when they're loaded
	useEffect(() => {
		if (rolesWithPermissions.length > 0) {
			rolesWithPermissions.forEach((role) => {
				if (role.permissions === undefined) {
					void fetchPermissionsForRole(role.role);
				}
			});
		}
	}, [rolesWithPermissions, fetchPermissionsForRole]);

	const filteredRoles = useMemo(() => {
		if (!searchQuery.trim()) {
			return rolesWithPermissions;
		}

		const query = searchQuery.toLowerCase().trim();
		return rolesWithPermissions.filter((role) => role.role.toLowerCase().includes(query));
	}, [rolesWithPermissions, searchQuery]);

	return {
		roles: filteredRoles,
		allRoles: rolesWithPermissions,
		isFeatureEnabled: rolesQuery.data?.isFeatureEnabled ?? null,
		isLoading: rolesQuery.isLoading,
		error: rolesQuery.error,
		refetch: rolesQuery.refetch,
		createRole: createRoleMutation.mutateAsync,
		deleteRole: deleteRoleMutation.mutateAsync,
		isCreatingRole: createRoleMutation.isPending,
		isDeletingRole: deleteRoleMutation.isPending,
		fetchPermissionsForRole,
		searchQuery,
		setSearchQuery,
	};
};
