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
import { getSelectedTenantId, setSelectedTenantId } from "@utils";
import { useEffect, useState } from "react";

export const useTenants = () => {
	const { fetchTenants } = useListTenantsService();
	const [selectedTenant, setSelectedTenantState] = useState<string | undefined>(getSelectedTenantId());

	const {
		data: tenantsResponse,
		isLoading,
		error,
		refetch: refetchTenants,
	} = useQuery({
		queryKey: ["tenants"],
		queryFn: fetchTenants,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: true,
	});

	const tenants = tenantsResponse?.tenants;

	// Auto-select first tenant if none selected and tenants are available
	useEffect(() => {
		if (tenants && tenants.length > 0 && !selectedTenant) {
			const firstTenant = tenants[0].tenantId;
			setSelectedTenantId(firstTenant);
			setSelectedTenantState(firstTenant);
		}
	}, [tenants, selectedTenant]);

	// Validate selected tenant still exists in the list
	useEffect(() => {
		if (tenants && selectedTenant) {
			const tenantExists = tenants.some((t) => t.tenantId === selectedTenant);
			if (!tenantExists) {
				// Selected tenant no longer exists, fall back to first tenant
				const firstTenant = tenants[0]?.tenantId;
				if (firstTenant) {
					setSelectedTenantId(firstTenant);
					setSelectedTenantState(firstTenant);
				}
			}
		}
	}, [tenants, selectedTenant]);

	const setSelectedTenant = (tenantId: string) => {
		setSelectedTenantId(tenantId);
		setSelectedTenantState(tenantId);
	};

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
