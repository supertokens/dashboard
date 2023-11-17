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

import useRolesService from "../../../../../api/userroles/role";
import { usePermissionsService } from "../../../../../api/userroles/role/permissions";
import { getImageUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Badge from "../../../badge";
import Button from "../../../button";
import IconButton from "../../../common/iconButton";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import TagsInputField from "../../../inputField/TagsInputField";
import { Role } from "../../types";
import DeletePermissions from "../DeletePermissions";
import DeletePermissionDialog from "./DeletePermission";
import "./editRole.scss";

export default function EditRoleDialog({
	roles,
	setRoles,
	onCloseDialog,
	currentlySelectedRole,
}: {
	onCloseDialog: () => void;
	currentlySelectedRole: Role;
	roles: Role[];
	setRoles: (roles: Role[]) => void;
}) {
	const { showToast } = useContext(PopupContentContext);

	//	to toggle between editing and readonly mode.
	const [isInEditingMode, setIsInEditingMode] = useState(false);
	//	to track addPermissionsToRole loading http state.
	const [isSaving, setIsSaving] = useState(false);

	// to track deleting roles loading http state.
	const [isDeletingRoles, setIsDeletingRoles] = useState(false);

	const [isDeletePermissionsDialogOpen, setIsDeletePermissionsDialogOpen] = useState(false);

	//	new permissions added by the user.
	const [newlyAddedPermissions, setNewlyAddedPermissions] = useState<string[]>([]);

	//	to store permissions that needs to be deleted
	const [permissionsToDelete, setPermissionsToDelete] = useState<string[]>([]);

	const { removePermissionsFromRole } = usePermissionsService();
	const { createRoleOrUpdateARole } = useRolesService();

	async function handleAddingNewPermissionsToARole() {
		setIsSaving(true);
		try {
			await createRoleOrUpdateARole(currentlySelectedRole.role, newlyAddedPermissions);

			showToast({
				iconImage: getImageUrl("checkmark-green.svg"),
				toastType: "success",
				children: "Role updated successfully!",
			});

			const updatedRolesData = roles.map((role) => {
				if (role.role === currentlySelectedRole.role) {
					role.permissions = [...currentlySelectedRole.permissions, ...newlyAddedPermissions];
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

	async function handleDeletePermissions() {
		setIsDeletingRoles(true);

		try {
			await removePermissionsFromRole(currentlySelectedRole.role, permissionsToDelete);

			const filteredPermissions = currentlySelectedRole.permissions.filter(
				(p) => permissionsToDelete.includes(p) === false
			);

			const updatedRolesData = roles.map((role) => {
				if (role.role === currentlySelectedRole.role) {
					role.permissions = filteredPermissions;
				}
				return role;
			});

			setRoles(updatedRolesData);
			setPermissionsToDelete([]);
			showToast({
				iconImage: getImageUrl("checkmark-green.svg"),
				toastType: "success",
				children:
					permissionsToDelete.length === 1
						? "Permission deleted successfully!"
						: "Permissions deleted successfully!",
			});
			setIsDeletePermissionsDialogOpen(false);
		} catch (_) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		} finally {
			setIsDeletingRoles(false);
		}
	}

	if (isDeletePermissionsDialogOpen) {
		return (
			<DeletePermissionDialog
				onCloseDialog={() => setIsDeletePermissionsDialogOpen(false)}
				selectedPermissions={permissionsToDelete}
				isDeletingRoles={isDeletingRoles}
				handleDeletePermissions={handleDeletePermissions}
			/>
		);
	}

	//	 this function will check if the user have any not saved changes
	//	 promts to confirm if they want to discard there changes.
	function askToDiscardChanges(callback: () => void) {
		if (newlyAddedPermissions.length > 0) {
			if (confirm("You have unsaved changes! \nDo you want to discard the changes you've made?")) {
				setNewlyAddedPermissions([]);
				callback();
			}
			return;
		} else {
			callback();
		}
	}

	return (
		<Dialog
			title="Role Info"
			onCloseDialog={() => askToDiscardChanges(onCloseDialog)}>
			<DialogContent>
				{isInEditingMode ? (
					<>
						<div className="edit-role-content">
							<div>
								<span className="label">Name of the Role</span>
								<span className="role-name">{currentlySelectedRole.role}</span>
							</div>
							<div>
								<TagsInputField
									addTag={(permision: string) => {
										if (
											currentlySelectedRole.permissions.includes(permision) === false &&
											newlyAddedPermissions.includes(permision) === false
										) {
											if (permision !== "") {
												setNewlyAddedPermissions([...newlyAddedPermissions, permision]);
											}
										} else {
											showToast({
												iconImage: getImageUrl("form-field-error-icon.svg"),
												toastType: "error",
												children: <>Permission already exists!</>,
											});
										}
									}}
									removeTag={(permission) => {
										setNewlyAddedPermissions(newlyAddedPermissions.filter((p) => p !== permission));
									}}
									tags={newlyAddedPermissions}
									label="Add Permissions"
									placeholder="Write permission name and press enter"
									name="permisions"
									type="text"
									autoComplete="off"
									focusText="Press “Save” to add this permissions in list below."
								/>
								<DeletePermissions
									onDelete={() => setIsDeletePermissionsDialogOpen(true)}
									permissions={currentlySelectedRole.permissions}
									permissionsToDelete={permissionsToDelete}
									setPermissionsToDelete={setPermissionsToDelete}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={() =>
									askToDiscardChanges(() => {
										setIsInEditingMode(false);
									})
								}
								color="gray-outline">
								Go Back
							</Button>
							<Button
								disabled={newlyAddedPermissions.length === 0 || isSaving}
								isLoading={isSaving}
								onClick={handleAddingNewPermissionsToARole}>
								Save
							</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<div className="edit-role-content">
							<div>
								<span className="label">Name of the Role</span>
								<span className="role-name">{currentlySelectedRole.role}</span>
							</div>
							<div>
								<span className="label">Permissions</span>
								<div className="permissions-list-container">
									{currentlySelectedRole.permissions.map((permission) => {
										return (
											<Badge
												text={permission}
												key={permission}
											/>
										);
									})}
									{currentlySelectedRole.permissions.length < 1 ? (
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
