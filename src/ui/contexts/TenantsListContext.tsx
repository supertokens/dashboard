/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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
import { PropsWithChildren, createContext, useContext, useState } from "react";
import { Tenant } from "../../api/tenants/list";
import { getSelectedTenantId, setSelectedTenantId } from "../../utils";

type TenantsListContextType = {
	tenantsListFromStore: Tenant[] | undefined;
	setTenantsListToStore: (tenantsList: Tenant[]) => void;
	setSelectedTenant: (tenantId: string) => void;
	getSelectedTenant: () => string | undefined;
};

const TenantsListContext = createContext<TenantsListContextType | undefined>(undefined);

export const useTenantsListContext = () => {
	const context = useContext(TenantsListContext);
	if (!context) throw "Context must be used within a provider!";
	return context;
};

export const TenantsListContextProvider: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
	const [tenantsListFromStore, setTenantsListToStore] = useState<Tenant[] | undefined>(undefined);
	const [selectedTenant, setSelectedTenant] = useState<string | undefined>(undefined);

	const contextValue: TenantsListContextType = {
		tenantsListFromStore,
		setTenantsListToStore,
		setSelectedTenant: (tenantId: string) => {
			setSelectedTenantId(tenantId);
			setSelectedTenant(tenantId);
		},
		getSelectedTenant: () => {
			return getSelectedTenantId();
		},
	};

	return <TenantsListContext.Provider value={contextValue}>{children}</TenantsListContext.Provider>;
};
