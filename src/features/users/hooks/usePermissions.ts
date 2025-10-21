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

import { useQuery } from "@tanstack/react-query";

import { usePermissionsService } from "@api/userroles/role/permissions";

const QUERY_KEY = "role-permissions";
const STALE_TIME = 30 * 1000; // 30 seconds

export const queryKeys = {
	permissions: (role: string) => [QUERY_KEY, role] as const,
};

export const usePermissions = (role: string, enabled = true) => {
	const { getPermissionsForRole } = usePermissionsService();

	const permissionsQuery = useQuery({
		queryKey: queryKeys.permissions(role),
		queryFn: () => getPermissionsForRole(role),
		staleTime: STALE_TIME,
		enabled: enabled && !!role,
		retry: false,
	});

	return {
		permissions: permissionsQuery.data,
		isLoading: permissionsQuery.isLoading,
		error: permissionsQuery.error,
		refetch: permissionsQuery.refetch,
	};
};
