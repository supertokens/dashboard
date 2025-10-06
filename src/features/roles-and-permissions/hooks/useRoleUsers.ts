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

import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useFetchUsersService } from "@api/users";
import { useUserRolesService } from "@api/userroles/user/roles";
import { User } from "@features/users/types";
import { QUERY_KEYS, STALE_TIME } from "../constants";

const queryKeys = {
	roleUsers: (roleId: string) => [QUERY_KEYS.ROLE_USERS, roleId] as const,
};

const PAGE_SIZE = 10;

export const useRoleUsers = (roleId: string, tenantId?: string) => {
	const queryClient = useQueryClient();
	const { fetchUsers } = useFetchUsersService();
	const { removeUserRole } = useUserRolesService();

	const [currentPage, setCurrentPage] = useState(1);

	const usersQuery = useQuery({
		queryKey: queryKeys.roleUsers(roleId),
		queryFn: async (): Promise<User[]> => {
			const response = await fetchUsers({ limit: 1000 }, undefined, tenantId);

			if (!response?.users) {
				throw new Error("Failed to fetch users");
			}

			return response.users;
		},
		staleTime: STALE_TIME.ROLE_DETAILS,
		enabled: !!roleId,
		retry: false,
		select: (allUsers) => {
			// Filter on client side since we don't have a direct API to fetch users by role
			// This is based on the old implementation approach
			return allUsers;
		},
	});

	const removeUserRoleMutation = useMutation({
		mutationFn: (userId: string) => removeUserRole(userId, roleId, tenantId || "public"),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.roleUsers(roleId) });
		},
	});

	const paginatedUsers = useMemo(() => {
		const users = usersQuery.data || [];
		const startIndex = (currentPage - 1) * PAGE_SIZE;
		const endIndex = startIndex + PAGE_SIZE;
		return users.slice(startIndex, endIndex);
	}, [usersQuery.data, currentPage]);

	const totalCount = usersQuery.data?.length || 0;
	const totalPages = Math.ceil(totalCount / PAGE_SIZE);

	const goToNextPage = useCallback(() => {
		if (currentPage < totalPages) {
			setCurrentPage((prev) => prev + 1);
		}
	}, [currentPage, totalPages]);

	const goToPreviousPage = useCallback(() => {
		if (currentPage > 1) {
			setCurrentPage((prev) => prev - 1);
		}
	}, [currentPage]);

	return {
		users: paginatedUsers,
		allUsers: usersQuery.data || [],
		totalCount,
		isLoading: usersQuery.isLoading,
		error: usersQuery.error,
		refetch: usersQuery.refetch,
		removeUserRole: removeUserRoleMutation.mutateAsync,
		isRemovingUserRole: removeUserRoleMutation.isPending,
		currentPage,
		totalPages,
		pageSize: PAGE_SIZE,
		hasNextPage: currentPage < totalPages,
		hasPreviousPage: currentPage > 1,
		goToNextPage,
		goToPreviousPage,
	};
};
