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

import { useEffect, useState } from "react";

import useRolesService from "../../../api/userroles/role";
import { AppEnvContextProvider } from "../../contexts/AppEnvContext";

import { usePermissionsService } from "../../../api/userroles/role/permissions";
import Search from "../../components/search";
import { RolesTable } from "../../components/userroles/components/RolesTable";

import CreateNewRole from "../../components/userroles/components/CreateNewRole";
import "./index.scss";

export default function UserRolesList() {
	const { getRoles, createRole, deleteRole } = useRolesService();
	const { addPermissionsToRole, removePermissionsFromRole } = usePermissionsService();

	const [roles, setRoles] = useState<{ role: string; permissions: string[] }[]>([]);

	async function fetchRoles() {
		const response = await getRoles();
		if (response.status === "OK") {
			setRoles(response.roles);
		}
	}

	async function handleCreateRole() {
		const role = document.getElementById("role") as HTMLInputElement;
		const permissions = document.getElementById("permissions") as HTMLInputElement;

		await createRole(role.value, permissions.value.trim() !== "" ? permissions.value.split(",") : []);

		alert("role created!");
	}

	async function handleDeleteRole(role: string) {
		const response = await deleteRole(role);
		alert("role deleted");
	}

	async function handleAddPermissions(role: string, permissionsInputId: string) {
		const permissionsInput = document.getElementById(permissionsInputId) as HTMLInputElement;

		await addPermissionsToRole(role, permissionsInput.value.trim() !== "" ? permissionsInput.value.split(",") : []);

		alert("role updated with permisssions");
	}

	async function handleDeletePermissions(role: string, permission: string) {
		await removePermissionsFromRole(role, [permission]);
		alert("permission removed");
	}

	useEffect(() => {
		void fetchRoles();
	}, []);

	async function onSearch(paginationToken?: string, search?: object) {
		return;
	}

	return (
		<AppEnvContextProvider
			connectionURI={
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(window as any).connectionURI
			}>
			<div className="userroles-container">
				<h1 className="users-list-title">Roles and Permissions</h1>
				<p className="text-small users-list-subtitle">
					One place to manage all your user Roles and Permissions. Edit roles and permissions according to
					your needs.
				</p>
				<div className="search-add-role-container">
					<Search
						loading
						onSearch={onSearch}
					/>
					<CreateNewRole />
				</div>

				<RolesTable />
			</div>
		</AppEnvContextProvider>
	);
}
