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

import { useListTenantsService } from "@api/tenants";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";
import { getSelectedTenantIdFromLocalStorage, setSelectedTenantIdToLocalStorage } from "@utils";

const TENANTS_QUERY_KEY = "tenants";
const TENANTS_STALE_TIME = 5 * 60 * 1000; // 5 minutes

interface TenantStore {
	selectedTenant: string | undefined;
	setSelectedTenant: (tenantId: string) => void;
	initializeTenant: () => void;
}

const useTenantStore = create<TenantStore>((set) => ({
	selectedTenant: undefined,

	setSelectedTenant: (tenantId: string) => {
		setSelectedTenantIdToLocalStorage(tenantId);
		set({ selectedTenant: tenantId });
	},

	initializeTenant: () => {
		const storedTenant = getSelectedTenantIdFromLocalStorage();
		if (storedTenant) {
			set({ selectedTenant: storedTenant });
		}
	},
}));

export const useTenants = () => {
	const { fetchTenants } = useListTenantsService();
	const { selectedTenant, setSelectedTenant, initializeTenant } = useTenantStore();

	const {
		data: tenantsResponse,
		isLoading,
		error,
		refetch: refetchTenants,
	} = useQuery({
		queryKey: [TENANTS_QUERY_KEY],
		queryFn: fetchTenants,
		staleTime: TENANTS_STALE_TIME,
		refetchOnWindowFocus: false,
	});

	const tenants = tenantsResponse?.tenants;

	useEffect(() => {
		initializeTenant();
	}, [initializeTenant]);

	useEffect(() => {
		if (tenants && tenants.length > 0 && !selectedTenant) {
			const firstTenant = tenants[0].tenantId;
			setSelectedTenant(firstTenant);
		}
	}, [tenants, selectedTenant, setSelectedTenant]);

	useEffect(() => {
		if (tenants && selectedTenant) {
			const tenantExists = tenants.some((t) => t.tenantId === selectedTenant);
			if (!tenantExists) {
				const firstTenant = tenants[0]?.tenantId;
				if (firstTenant) {
					setSelectedTenant(firstTenant);
				}
			}
		}
	}, [tenants, selectedTenant, setSelectedTenant]);

	const getSelectedTenant = () => {
		return selectedTenant;
	};

	return {
		tenants,
		isLoading,
		error,
		refetchTenants,
		selectedTenant,
		setSelectedTenant,
		getSelectedTenant,
	};
};
