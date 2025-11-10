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

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

import { useCreateTenantService, useDeleteTenantService, useListTenantsService } from "@api/tenants";
import type { Tenant } from "@api/tenants/types";

import { QUERY_KEYS, STALE_TIME } from "../constants";
import { Implementation } from "../../../implementation";

const queryKeys = {
	tenants: () => [QUERY_KEYS.TENANTS] as const,
};

interface TenantStore {
	selectedTenant: string | undefined;
	setSelectedTenant: (tenantId: string) => void;
	initializeTenant: () => void;
}

const useTenantStore = create<TenantStore>((set) => ({
	selectedTenant: undefined,

	setSelectedTenant: (tenantId: string) => {
		Implementation.getInstanceOrThrow().setSelectedTenantIdToLocalStorage(tenantId);
		set({ selectedTenant: tenantId });
	},

	initializeTenant: () => {
		const storedTenant = Implementation.getInstanceOrThrow().getSelectedTenantIdFromLocalStorage();
		if (storedTenant) {
			set({ selectedTenant: storedTenant });
		}
	},
}));

export const useTenants = () => {
	const queryClient = useQueryClient();
	const { fetchTenants } = useListTenantsService();
	const createTenant = useCreateTenantService();
	const deleteTenant = useDeleteTenantService();
	const { selectedTenant, setSelectedTenant, initializeTenant } = useTenantStore();

	const [searchQuery, setSearchQuery] = useState("");

	const tenantsQuery = useQuery({
		queryKey: queryKeys.tenants(),
		queryFn: async () => {
			const response = await fetchTenants();
			return await Implementation.getInstanceOrThrow().processFetchTenantsResponse({ response });
		},
		staleTime: STALE_TIME.TENANTS,
		retry: false,
	});

	const createTenantMutation = useMutation({
		mutationFn: (tenantId: string) => createTenant(tenantId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.tenants() });
		},
	});

	const deleteTenantMutation = useMutation({
		mutationFn: (tenantId: string) => deleteTenant(tenantId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.tenants() });
		},
	});

	const filteredTenants = useMemo(() => {
		const tenants = tenantsQuery.data || [];
		return Implementation.getInstanceOrThrow().filterTenantsBySearchQuery({ tenants, searchQuery });
	}, [tenantsQuery.data, searchQuery]);

	useEffect(() => {
		initializeTenant();
	}, [initializeTenant]);

	useEffect(() => {
		const tenants = tenantsQuery.data;
		if (tenants && tenants.length > 0 && !selectedTenant) {
			const firstTenant = tenants[0].tenantId;
			setSelectedTenant(firstTenant);
		}
	}, [tenantsQuery.data, selectedTenant, setSelectedTenant]);

	useEffect(() => {
		const tenants = tenantsQuery.data;
		if (tenants && selectedTenant) {
			const tenantExists = tenants.some((t) => t.tenantId === selectedTenant);
			if (!tenantExists) {
				const firstTenant = tenants[0]?.tenantId;
				if (firstTenant) {
					setSelectedTenant(firstTenant);
				}
			}
		}
	}, [tenantsQuery.data, selectedTenant, setSelectedTenant]);

	return {
		tenants: filteredTenants,
		allTenants: tenantsQuery.data || [],
		isLoading: tenantsQuery.isLoading,
		error: tenantsQuery.error,
		refetch: tenantsQuery.refetch,
		createTenant: createTenantMutation.mutateAsync,
		deleteTenant: deleteTenantMutation.mutateAsync,
		isCreatingTenant: createTenantMutation.isPending,
		isDeletingTenant: deleteTenantMutation.isPending,
		searchQuery,
		setSearchQuery,
		selectedTenant,
		setSelectedTenant,
		getSelectedTenant: () => selectedTenant,
	};
};
