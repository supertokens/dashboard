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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	useDeleteTenantService,
	useGetTenantInfoService,
	useUpdateCoreConfigService,
	useUpdateFirstFactorService,
	useUpdateRequiredSecondaryFactorService,
} from "@api/tenants";

import { QUERY_KEYS, STALE_TIME } from "../constants";

const queryKeys = {
	tenantDetails: (tenantId: string) => [QUERY_KEYS.TENANT_DETAILS, tenantId] as const,
	tenants: () => [QUERY_KEYS.TENANTS] as const,
};

export const useTenantDetails = (tenantId: string) => {
	const queryClient = useQueryClient();
	const getTenantInfo = useGetTenantInfoService();
	const deleteTenant = useDeleteTenantService();
	const updateFirstFactor = useUpdateFirstFactorService();
	const updateRequiredSecondaryFactor = useUpdateRequiredSecondaryFactorService();
	const updateCoreConfig = useUpdateCoreConfigService();

	const tenantDetailsQuery = useQuery({
		queryKey: queryKeys.tenantDetails(tenantId),
		queryFn: async () => {
			const response = await getTenantInfo(tenantId);

			if (!response) {
				throw new Error("Failed to fetch tenant details");
			}

			if (response.status === "OK") {
				return response.tenant;
			}

			if (response.status === "UNKNOWN_TENANT_ERROR") {
				throw new Error("Tenant not found");
			}

			throw new Error("Failed to fetch tenant details");
		},
		staleTime: STALE_TIME.TENANT_DETAILS,
		enabled: !!tenantId,
		retry: false,
	});

	const deleteTenantMutation = useMutation({
		mutationFn: () => deleteTenant(tenantId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.tenants() });
		},
	});

	const updateFirstFactorMutation = useMutation({
		mutationFn: ({ factorId, enable }: { factorId: string; enable: boolean }) =>
			updateFirstFactor(tenantId, factorId, enable),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.tenantDetails(tenantId) });
		},
	});

	const updateRequiredSecondaryFactorMutation = useMutation({
		mutationFn: ({ factorId, enable }: { factorId: string; enable: boolean }) =>
			updateRequiredSecondaryFactor(tenantId, factorId, enable),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.tenantDetails(tenantId) });
		},
	});

	const updateCoreConfigMutation = useMutation({
		mutationFn: ({ name, value }: { name: string; value: string | number | boolean | null }) =>
			updateCoreConfig(tenantId, name, value),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.tenantDetails(tenantId) });
		},
	});

	return {
		tenantInfo: tenantDetailsQuery.data,
		isLoading: tenantDetailsQuery.isLoading,
		error: tenantDetailsQuery.error,
		refetch: tenantDetailsQuery.refetch,
		deleteTenant: deleteTenantMutation.mutateAsync,
		updateFirstFactor: updateFirstFactorMutation.mutateAsync,
		updateRequiredSecondaryFactor: updateRequiredSecondaryFactorMutation.mutateAsync,
		updateCoreConfig: updateCoreConfigMutation.mutateAsync,
		isDeletingTenant: deleteTenantMutation.isPending,
		isUpdatingFirstFactor: updateFirstFactorMutation.isPending,
		isUpdatingRequiredSecondaryFactor: updateRequiredSecondaryFactorMutation.isPending,
		isUpdatingCoreConfig: updateCoreConfigMutation.isPending,
	};
};
