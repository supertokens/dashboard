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
import { Tenant } from "../../../../api/tenants/list";
import Pagination from "../../pagination";
import { RecipePill } from "../../recipePill/RecipePill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";
import { PlaceholderTableRows } from "../../usersListTable/UsersListTable";
import { NoTenants } from "../noTenants/NoTenants";
import "./tenantsListTable.scss";

type TenantsListTableProps = {
	tenants: Array<Tenant> | undefined;
	currentActivePage: number;
	totalPages: number;
	totalTenantsCount: number;
	pageLimit: number;
	setCurrentActivePage: (page: number) => void;
	selectTenant: (tenantId: string) => void;
};

const TenantLoginMethods = ({ tenant }: { tenant: Tenant }) => {
	return (
		<div className="tenant-login-methods">
			{tenant.emailPassword.enabled && (
				<RecipePill
					recipeId="emailpassword"
					label="Email Password"
				/>
			)}
			{tenant.passwordless.enabled && (
				<RecipePill
					recipeId="passwordless"
					label="Passwordless"
				/>
			)}
			{tenant.thirdParty.enabled && (
				<RecipePill
					recipeId="thirdparty"
					label="Third Party"
				/>
			)}
		</div>
	);
};

export const TenantsListTable = ({
	tenants,
	currentActivePage,
	totalPages,
	totalTenantsCount,
	pageLimit,
	setCurrentActivePage,
	selectTenant,
}: TenantsListTableProps) => {
	const paginatedTenants = tenants?.slice((currentActivePage - 1) * pageLimit, currentActivePage * pageLimit);

	if (Array.isArray(paginatedTenants) && paginatedTenants.length === 0) {
		return <NoTenants />;
	}

	return (
		<Table
			className="theme-blue"
			pagination={
				<Pagination
					className="tenant-list-table-pagination"
					handleNext={() => setCurrentActivePage(currentActivePage + 1)}
					handlePrevious={() => setCurrentActivePage(currentActivePage - 1)}
					limit={pageLimit}
					currentActivePage={currentActivePage}
					totalPages={totalPages}
					offset={paginatedTenants?.length ?? 0}
					totalItems={totalTenantsCount}
				/>
			}>
			<TableHeader>
				<TableRow>
					<TableHead className="tenant-id-column">Tenant ID</TableHead>
					<TableHead>Login Methods</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.isArray(paginatedTenants) ? (
					paginatedTenants.map((tenant) => {
						return (
							<TableRow
								role="button"
								key={tenant.tenantId}
								onClick={() => {
									selectTenant(tenant.tenantId);
								}}
								// The following tabIndex and onKeyDown are required for accessibility
								// to make the row clickable using keyboard
								tabIndex={0}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
										selectTenant(tenant.tenantId);
									}
								}}>
								<TableCell>{tenant.tenantId}</TableCell>
								<TableCell>
									<TenantLoginMethods tenant={tenant} />
								</TableCell>
							</TableRow>
						);
					})
				) : (
					<PlaceholderTableRows
						rowCount={10}
						colSpan={3}
					/>
				)}
			</TableBody>
		</Table>
	);
};
