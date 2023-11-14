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

import { useContext, useState } from "react";

import { usePermissionsService } from "../../../../../api/userroles/role/permissions";
import { getImageUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Badge from "../../../badge";
import Button from "../../../button";
import IconButton from "../../../common/iconButton";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import { Role } from "../../types";
import SelectPermissions from "../SelectPermissions";
import DeletePermissionDialog from "./DeletePermission";
import "./editRole.scss";

export default function EditRoleDialog({
	roles,
	setRoles,
	onCloseDialog,
	selectedRole,
}: {
	onCloseDialog: () => void;
	selectedRole: Role;
	roles: Role[];
	setRoles: (roles: Role[]) => void;
}) {
	const { showToast } = useContext(PopupContentContext);

	//	to toggle between editing and readonly mode.
	const [isInEditingMode, setIsInEditingMode] = useState(false);
	//	to track addPermissionsToRole http state.
	const [isSaving, setIsSaving] = useState(false);
	const [isDeletePermissionsDialogOpen, setIsDeletePermissionsDialogOpen] = useState(false);

	const [permissions, setPermissions] = useState(selectedRole.permissions);

	//	to store permissions that needs to be deleted
	const [permissionsToDelete, setPermissionsToDelete] = useState<string[]>([]);

	const { addPermissionsToRole } = usePermissionsService();

	function addPermission(newPermissions: string[]) {
		setPermissions([...permissions, ...newPermissions]);
	}

	async function handleSave() {
		setIsSaving(true);
		try {
			await addPermissionsToRole(selectedRole.role, permissions);

			showToast({
				iconImage: getImageUrl("checkmark-green.svg"),
				toastType: "success",
				children: "Role updated successfully!",
			});

			const updatedRolesData = roles.map((role) => {
				if (role.role === selectedRole.role) {
					role.permissions = permissions;
				}
				return role;
			});
			setRoles(updatedRolesData);

			onCloseDialog();
		} catch (_) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		} finally {
			setIsSaving(false);
		}
	}

	if (isDeletePermissionsDialogOpen) {
		return (
			<DeletePermissionDialog
				roles={roles}
				setRoles={setRoles}
				selectedRole={selectedRole}
				onCloseDialog={() => setIsDeletePermissionsDialogOpen(false)}
				resetPermissionsToDelete={() => setPermissionsToDelete([])}
				selectedPermissions={permissionsToDelete}
				updatePermissions={setPermissions}
			/>
		);
	}

	return (
		<Dialog
			title="Role Info"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				{isInEditingMode ? (
					<>
						<div className="edit-role-content">
							<div>
								<span className="label">Name of the Role</span>
								<span className="role-name">{selectedRole.role}</span>
							</div>
							<div>
								<SelectPermissions
									openDeletePermissionsDialog={() => setIsDeletePermissionsDialogOpen(true)}
									permissionsToDelete={permissionsToDelete}
									setPermissionsToDelete={setPermissionsToDelete}
									addPermissions={addPermission}
									permissions={permissions}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={() => setIsInEditingMode(false)}
								color="gray-outline">
								Go Back
							</Button>
							<Button
								disabled={permissions.length === 0 || isSaving}
								isLoading={isSaving}
								onClick={handleSave}>
								Save
							</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<div className="edit-role-content">
							<div>
								<span className="label">Name of the Role</span>
								<span className="role-name">{selectedRole.role}</span>
							</div>
							<div>
								<span className="label">Permissions</span>
								<div className="permissions-list-container">
									{permissions.map((permission) => {
										return (
											<Badge
												text={permission}
												key={permission}
											/>
										);
									})}
									{permissions.length < 1 ? (
										<Button
											size="xs"
											color="info">
											No Permissions for this Role
										</Button>
									) : null}
								</div>
							</div>
						</div>
						<DialogFooter justifyContent="space-between">
							<IconButton
								size="small"
								text="Edit"
								tint="var(--color-link)"
								icon={getImageUrl("edit.svg")}
								onClick={() => {
									setIsInEditingMode(true);
								}}
							/>
							<Button
								onClick={onCloseDialog}
								color="gray-outline">
								Go Back
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
