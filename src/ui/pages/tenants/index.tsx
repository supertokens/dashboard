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

import { useContext, useDeferredValue, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useGetTenantsList, type Tenant } from "../../../api/tenants/list";
import { ReactComponent as PlusIcon } from "../../../assets/plus.svg";
import { getImageUrl, useQuery } from "../../../utils";
import Button from "../../components/button";
import { SearchInput } from "../../components/searchInput/SearchInput";
import { CreateNewTenantDialog } from "../../components/tenants/creatNewTenant/CreateNewTenant";
import { TenantDetail } from "../../components/tenants/tenantDetail/TenantDetail";
import { TenantsListTable } from "../../components/tenants/tenantsListTable/TenantsListTable";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import "./index.scss";

const TENANTS_PAGINATION_LIMIT = 10;

const TenantList = ({ selectTenant }: { selectTenant: (tenantId: string) => void }) => {
	const { fetchTenants } = useGetTenantsList();
	const { showToast } = useContext(PopupContentContext);
	const [tenants, setTenants] = useState<Array<Tenant> | undefined>(undefined);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isCreateTenantDialogOpen, setIsCreateTenantDialogOpen] = useState(false);
	const [currentActivePage, setCurrentActivePage] = useState(1);
	const deferredSearchQuery = useDeferredValue(searchQuery);

	const filteredTenants = tenants?.filter((tenant) =>
		tenant.tenantId.includes(deferredSearchQuery.trim().toLowerCase())
	);

	const totalTenantsCount = Array.isArray(filteredTenants) ? filteredTenants.length : 0;
	const totalPages = Math.ceil(totalTenantsCount / TENANTS_PAGINATION_LIMIT);

	useEffect(() => {
		const getTenants = async () => {
			try {
				const response = await fetchTenants();
				if (response?.status === "OK") {
					setTenants(response.tenants);
				} else {
					throw new Error("Failed to fetch tenants");
				}
			} catch (err) {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Something went wrong Please try again!</>,
				});
			}
		};
		void getTenants();
	}, []);

	return (
		<div className="tenants-container">
			<h1 className="tenants-title">Tenant Management</h1>
			<p className="text-small tenants-subtitle">
				One place to manage all your tenants. Create or edit tenants and their login methods according to your
				needs.
			</p>
			<div className="search-container">
				<SearchInput
					placeholder="Search"
					onClear={() => {
						setSearchQuery("");
					}}
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value);
					}}
				/>
				<Button
					disabled={!Array.isArray(tenants)}
					onClick={() => setIsCreateTenantDialogOpen(true)}
					color="secondary"
					id="create-tenant">
					<PlusIcon />
					Add Tenant
				</Button>
				{isCreateTenantDialogOpen && (
					<CreateNewTenantDialog
						onCloseDialog={() => setIsCreateTenantDialogOpen(false)}
						currentTenantIds={tenants?.map((tenant) => tenant.tenantId) ?? []}
					/>
				)}
			</div>
			<TenantsListTable
				tenants={filteredTenants}
				currentActivePage={currentActivePage}
				totalPages={totalPages}
				totalTenantsCount={totalTenantsCount}
				setCurrentActivePage={setCurrentActivePage}
				pageLimit={TENANTS_PAGINATION_LIMIT}
				selectTenant={selectTenant}
			/>
		</div>
	);
};

const TenantManagement = () => {
	const query = useQuery();
	const navigate = useNavigate();
	const currentLocation = useLocation();
	const selectedTenantId = query.get("tenantId");

	const setSelectedTenantId = (tenantId: string) => {
		navigate(`?tenantId=${tenantId}`, {
			replace: true,
		});
	};

	const onBackButtonClicked = () => {
		navigate(currentLocation.pathname, {
			replace: true,
		});
	};

	return typeof selectedTenantId === "string" ? (
		<TenantDetail
			tenantId={selectedTenantId}
			onBackButtonClicked={onBackButtonClicked}
		/>
	) : (
		<TenantList selectTenant={setSelectedTenantId} />
	);
};

export default TenantManagement;
