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

import { useSearchParams } from "react-router-dom";

import { QUERY_PARAMS } from "@shared/navigation";
import TenantDetails from "@features/tenants/tenant-details/TenantDetails";

import TenantsList from "./components/TenantsList";

/**
 * This is the main component for the tenant management page.
 * It renders the tenant-detail page if a tenantId search param is provided in the URL,
 * otherwise it renders the tenants-list page.
 */
export default function TenantManagement() {
	const [searchParams] = useSearchParams();
	const tenantId = searchParams.get(QUERY_PARAMS.TENANT_ID);

	return tenantId ? <TenantDetails /> : <TenantsList />;
}
