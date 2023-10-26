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

import { useCallback, useEffect, useState } from "react";

import useRolesService from "../../../../api/userroles/role";
import Badge from "../../badge";
import Button from "../../button";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";
import { PlaceholderTableRows } from "../../usersListTable/UsersListTable";
import { useUserRolesContext } from "../context/UserRolesContext";
import { Role } from "../types";
import NoRolesFound from "./NoRolesFound";
import DeleteRolesDialog from "./dialogs/DeleteRoles";
import EditRoleDialog from "./dialogs/EditRole";
import "./rolesTable.scss";

export function RolesTable() {
	const { getRoles } = useRolesService();
	const { roles, setRoles } = useUserRolesContext();

	const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);

	const [selectedRolesToDelete, setSelectedRolesToDelete] = useState<string[]>([]);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(true);

	const [isLoading, setIsLoading] = useState(false);

	const fetchRoles = useCallback(async () => {
		setIsLoading(true);
		const response = await getRoles();

		if (response.status === "OK") {
			setRoles(response.roles);
		}
		setIsLoading(false);
	}, [roles]);

	useEffect(() => {
		void fetchRoles();
	}, []);

	if (isLoading === false && roles.length < 1) {
		return <NoRolesFound />;
	}

	return (
		<>
			<Table className="theme-blue">
				<TableHeader>
					<TableRow>
						<TableHead className="roles-column">
							<div className="checkbox-text-container">
								<input
									type="checkbox"
									name="check"
									id="check"
									onChange={(e) => {
										if (e.currentTarget.checked) {
											setSelectedRolesToDelete(roles.map(({ role }) => role));
										} else {
											setSelectedRolesToDelete([]);
										}
									}}
								/>
								User Roles
							</div>
						</TableHead>
						<TableHead>
							<div className="delete-btn-container">
								Permissions
								<Button
									onClick={() => {
										if (selectedRolesToDelete.length > 0) setShowDeleteDialog(true);
									}}
									color={selectedRolesToDelete.length > 0 ? "danger" : "gray"}
									size="sm">
									Delete
								</Button>
							</div>
						</TableHead>
					</TableRow>
				</TableHeader>
				{isLoading ? (
					<PlaceholderTableRows
						rowCount={10}
						colSpan={3}
						className={"user-info"}
					/>
				) : null}
				<TableBody>
					{roles.map(({ role, permissions }, index) => {
						const selected = selectedRolesToDelete.includes(role);
						return (
							<TableRow
								key={role}
								data-active={selected ? "true" : "false"}
								onClick={() => {
									setSelectedRole(roles[index]);
									setShowEditDialog(true);
								}}>
								<TableCell>
									<div className="checkbox-text-container">
										<input
											type="checkbox"
											name="check"
											id="check"
											checked={selected}
											onChange={(e) => {
												e.stopPropagation();
												if (e.currentTarget.checked) {
													setSelectedRolesToDelete([...selectedRolesToDelete, role]);
												} else {
													setSelectedRolesToDelete(
														selectedRolesToDelete.filter((r) => r !== role)
													);
												}
											}}
											onClick={(e) => e.stopPropagation()}
										/>
										{role}
									</div>
								</TableCell>
								<TableCell>
									<div className="permissions-container">
										{permissions.map((permission) => {
											return (
												<Badge
													key={permission}
													text={permission}
												/>
											);
										})}
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			{showDeleteDialog ? (
				<DeleteRolesDialog
					closeDialog={() => setShowDeleteDialog(false)}
					selectedRoles={selectedRolesToDelete}
					resetSelectedRoles={() => setSelectedRolesToDelete([])}
				/>
			) : null}
			{showEditDialog && selectedRole ? (
				<EditRoleDialog
					selectedRole={selectedRole}
					closeDialog={() => setShowEditDialog(false)}
				/>
			) : null}
		</>
	);
}
