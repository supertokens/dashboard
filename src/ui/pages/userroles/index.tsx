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

import { useState } from "react";
import { ReactComponent as PlusIcon } from "../../../assets/plus.svg";

import useRolesService from "../../../api/userroles/role";
import { AppEnvContextProvider } from "../../contexts/AppEnvContext";

import { usePermissionsService } from "../../../api/userroles/role/permissions";
import { RolesTable } from "../../components/userroles/components/RolesTable";

import Button from "../../components/button";
import CreateNewRole from "../../components/userroles/components/dialogs/CreateNewRole";
import UserRolesContextProvider from "../../components/userroles/context/UserRolesContext";
import "./index.scss";

export default function UserRolesList() {
	const { deleteRole } = useRolesService();
	const { addPermissionsToRole, removePermissionsFromRole } = usePermissionsService();

	const [isDialogOpen, setIsDialogOpen] = useState(false);

	function openDialog() {
		setIsDialogOpen(true);
	}

	function closeDialog() {
		setIsDialogOpen(false);
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

	async function onSearch(paginationToken?: string, search?: object) {
		return;
	}

	return (
		<AppEnvContextProvider
			connectionURI={
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(window as any).connectionURI
			}>
			<UserRolesContextProvider>
				<div className="userroles-container">
					<h1 className="users-list-title">Roles and Permissions</h1>
					<p className="text-small users-list-subtitle">
						One place to manage all your user Roles and Permissions. Edit roles and permissions according to
						your needs.
					</p>
					<div className="search-add-role-container">
						<Button
							onClick={openDialog}
							color="secondary">
							<PlusIcon />
							Add Role
						</Button>
						{isDialogOpen ? <CreateNewRole closeDialog={closeDialog} /> : null}
					</div>
					<RolesTable />
				</div>
			</UserRolesContextProvider>
		</AppEnvContextProvider>
	);
}
