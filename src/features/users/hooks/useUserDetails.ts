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

import { useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import useUserService from "@api/user";
import useMetadataService from "@api/user/metadata";
import useSessionsForUserService from "@api/user/sessions";
import { useUserRolesService } from "@api/userroles/user/roles";
import { usePermissionsService } from "@api/userroles/role/permissions";
import { useListTenantsService } from "@api/tenants";

import { User } from "@features/users/types";
import { Tenant } from "@api/tenants/types";

// Query configuration constants
const QUERY_CONFIG = {
	staleTime: {
		userDetails: 30 * 1000, // 30 seconds
		sessions: 10 * 1000, // 10 seconds
		metadata: 60 * 1000, // 1 minute
		roles: 30 * 1000, // 30 seconds
		permissions: 60 * 1000, // 1 minute
		tenants: 5 * 60 * 1000, // 5 minutes
	},
} as const;

// Query key constants
const QUERY_KEYS = {
	USER_DETAILS: "user-details",
	USER_SESSIONS: "user-sessions",
	USER_METADATA: "user-metadata",
	USER_ROLES: "user-roles",
	ROLE_PERMISSIONS: "role-permissions",
	TENANTS: "tenants",
} as const;

// Query key factories
const queryKeys = {
	userDetails: (userId: string) => [QUERY_KEYS.USER_DETAILS, userId] as const,
	sessions: (userId: string) => [QUERY_KEYS.USER_SESSIONS, userId] as const,
	metadata: (userId: string) => [QUERY_KEYS.USER_METADATA, userId] as const,
	roles: (userId: string, tenantId: string) => [QUERY_KEYS.USER_ROLES, userId, tenantId] as const,
	permissions: (role: string) => [QUERY_KEYS.ROLE_PERMISSIONS, role] as const,
	tenants: () => [QUERY_KEYS.TENANTS] as const,
} as const;

export interface UseUserDetailsOptions {
	readonly userId: string;
	readonly selectedTenantId?: string;
}

export const useUserDetails = (options: UseUserDetailsOptions) => {
	const { userId, selectedTenantId } = options;
	const queryClient = useQueryClient();

	const { getUser, updateUserInformation } = useUserService();
	const { getUserMetaData, updateUserMetaData } = useMetadataService();
	const { getSessionsForUser, deleteSessionsForUser } = useSessionsForUserService();
	const { getRolesForUser, addRoleToUser, removeUserRole } = useUserRolesService();
	const { getPermissionsForRole } = usePermissionsService();
	const { fetchTenants } = useListTenantsService();

	// User details query
	const userDetailsQuery = useQuery({
		queryKey: queryKeys.userDetails(userId),
		queryFn: () => getUser(userId),
		staleTime: QUERY_CONFIG.staleTime.userDetails,
		retry: false,
	});

	// Sessions query
	const sessionsQuery = useQuery({
		queryKey: queryKeys.sessions(userId),
		queryFn: () => getSessionsForUser(userId),
		staleTime: QUERY_CONFIG.staleTime.sessions,
		enabled: !!userId,
		retry: false,
	});

	// Metadata query
	const metadataQuery = useQuery({
		queryKey: queryKeys.metadata(userId),
		queryFn: () => getUserMetaData(userId),
		staleTime: QUERY_CONFIG.staleTime.metadata,
		enabled: !!userId,
		retry: false,
	});

	// Roles query - depends on selected tenant
	const rolesQuery = useQuery({
		queryKey: queryKeys.roles(userId, selectedTenantId || ""),
		queryFn: () => getRolesForUser(userId, selectedTenantId || "public"),
		staleTime: QUERY_CONFIG.staleTime.roles,
		enabled: !!userId && !!selectedTenantId,
		retry: false,
	});

	// Tenants query
	const tenantsQuery = useQuery({
		queryKey: queryKeys.tenants(),
		queryFn: () => fetchTenants(),
		staleTime: QUERY_CONFIG.staleTime.tenants,
		select: (data) => data?.tenants || [],
		retry: false,
	});

	// Permissions query for each role
	const useRolePermissions = (role: string) => {
		return useQuery({
			queryKey: queryKeys.permissions(role),
			queryFn: () => getPermissionsForRole(role),
			staleTime: QUERY_CONFIG.staleTime.permissions,
			enabled: !!role,
			retry: false,
		});
	};

	// Mutations
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
			void queryClient.invalidateQueries({ queryKey: queryKeys.userDetails(userId) });
		},
	});

	const updateMetadataMutation = useMutation({
		mutationFn: (data: { userId: string; metadata: string }) => updateUserMetaData(data.userId, data.metadata),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.metadata(userId) });
		},
	});

	const deleteSessionsMutation = useMutation({
		mutationFn: (sessionHandles: string[]) => deleteSessionsForUser(sessionHandles),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.sessions(userId) });
		},
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

	// Computed values
	const userDetails = userDetailsQuery.data;
	const sessions = sessionsQuery.data || [];
	const metadata = metadataQuery.data;
	const roles = rolesQuery.data;
	const tenants = tenantsQuery.data || [];

	const isLoading =
		userDetailsQuery.isLoading || sessionsQuery.isLoading || metadataQuery.isLoading || tenantsQuery.isLoading;

	const error =
		userDetailsQuery.error || sessionsQuery.error || metadataQuery.error || rolesQuery.error || tenantsQuery.error;

	// Helper functions
	const refetchAll = useCallback(async () => {
		await Promise.allSettled([
			userDetailsQuery.refetch(),
			sessionsQuery.refetch(),
			metadataQuery.refetch(),
			selectedTenantId ? rolesQuery.refetch() : Promise.resolve(),
		]);
	}, [userDetailsQuery, sessionsQuery, metadataQuery, rolesQuery, selectedTenantId]);

	const invalidateAll = useCallback(async () => {
		await Promise.allSettled([
			queryClient.invalidateQueries({ queryKey: queryKeys.userDetails(userId) }),
			queryClient.invalidateQueries({ queryKey: queryKeys.sessions(userId) }),
			queryClient.invalidateQueries({ queryKey: queryKeys.metadata(userId) }),
			selectedTenantId
				? queryClient.invalidateQueries({ queryKey: queryKeys.roles(userId, selectedTenantId) })
				: Promise.resolve(),
		]);
	}, [queryClient, userId, selectedTenantId]);

	return {
		// Data
		userDetails,
		sessions,
		metadata,
		roles,
		tenants,

		// Loading states
		isLoading,
		isLoadingUserDetails: userDetailsQuery.isLoading,
		isLoadingSessions: sessionsQuery.isLoading,
		isLoadingMetadata: metadataQuery.isLoading,
		isLoadingRoles: rolesQuery.isLoading,
		isLoadingTenants: tenantsQuery.isLoading,

		// Error states
		error,
		userDetailsError: userDetailsQuery.error,
		sessionsError: sessionsQuery.error,
		metadataError: metadataQuery.error,
		rolesError: rolesQuery.error,
		tenantsError: tenantsQuery.error,

		// Mutations
		updateUser: updateUserMutation.mutateAsync,
		updateMetadata: updateMetadataMutation.mutateAsync,
		deleteSessions: deleteSessionsMutation.mutateAsync,
		addRole: addRoleMutation.mutateAsync,
		removeRole: removeRoleMutation.mutateAsync,

		// Mutation states
		isUpdatingUser: updateUserMutation.isPending,
		isUpdatingMetadata: updateMetadataMutation.isPending,
		isDeletingSessions: deleteSessionsMutation.isPending,
		isAddingRole: addRoleMutation.isPending,
		isRemovingRole: removeRoleMutation.isPending,

		// Utilities
		refetchAll,
		invalidateAll,
		useRolePermissions,
	};
};
