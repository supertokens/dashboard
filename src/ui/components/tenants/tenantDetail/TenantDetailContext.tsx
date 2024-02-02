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

import { createContext, useContext } from "react";
import { TenantInfo } from "../../../../api/tenants/types";

type TenantDetailContextType = {
	tenantInfo: TenantInfo;
};

const TenantDetailContext = createContext<TenantDetailContextType | undefined>(undefined);

export const TenantDetailContextProvider = ({
	children,
	tenantInfo,
}: {
	children: React.ReactNode;
	tenantInfo: TenantInfo;
}) => {
	return <TenantDetailContext.Provider value={{ tenantInfo }}>{children}</TenantDetailContext.Provider>;
};

export const useTenantDetailContext = () => {
	const context = useContext(TenantDetailContext);
	if (context === undefined) {
		throw new Error("useTenantDetailContext must be used within a TenantDetailContextProvider");
	}
	return context;
};
