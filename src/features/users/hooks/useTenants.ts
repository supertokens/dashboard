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

import { useQuery } from "@tanstack/react-query";

import { useListTenantsService } from "@api/tenants";

const QUERY_KEY = "tenants";
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const queryKeys = {
	tenants: () => [QUERY_KEY] as const,
};

export const useTenants = () => {
	const { fetchTenants } = useListTenantsService();

	const tenantsQuery = useQuery({
		queryKey: queryKeys.tenants(),
		queryFn: () => fetchTenants(),
		staleTime: STALE_TIME,
		select: (data) => data?.tenants || [],
		retry: false,
	});

	return {
		tenants: tenantsQuery.data || [],
		isLoading: tenantsQuery.isLoading,
		error: tenantsQuery.error,
		refetch: tenantsQuery.refetch,
	};
};
