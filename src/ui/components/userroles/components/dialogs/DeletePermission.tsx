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
import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import { Role } from "../../types";

export default function DeletePermissionDialog({
	roles,
	selectedRole,
	selectedPermissions,
	setRoles,
	onCloseDialog,
	updatePermissions,
	resetPermissionsToDelete,
}: {
	roles: Role[];
	selectedPermissions: string[];
	selectedRole: Role;
	onCloseDialog: () => void;
	setRoles: (roles: Role[]) => void;
	resetPermissionsToDelete: () => void;
	updatePermissions: (permissions: string[]) => void;
}) {
	const { showToast } = useContext(PopupContentContext);

	const { removePermissionsFromRole } = usePermissionsService();

	const [isDeletingRoles, setIsDeletingRoles] = useState(false);

	const { permissions, role } = selectedRole;

	async function handleDeleteRoles() {
		if (selectedPermissions.length === 0) {
			return;
		}
		setIsDeletingRoles(true);

		try {
			await removePermissionsFromRole(role, selectedPermissions);

			const filteredPermissions = permissions.filter((p) => selectedPermissions.includes(p) === false);

			const updatedRolesData = roles.map((role) => {
				if (role.role === selectedRole.role) {
					role.permissions = filteredPermissions;
				}
				return role;
			});

			setRoles(updatedRolesData);
			updatePermissions(filteredPermissions);
			resetPermissionsToDelete();
			showToast({
				iconImage: getImageUrl("checkmark-green.svg"),
				toastType: "success",
				children:
					selectedPermissions.length === 1
						? "Permission deleted successfully!"
						: "Permissions deleted successfully!",
			});
			onCloseDialog();
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

	return (
		<Dialog
			title="Delete Permission?"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<p className="you-sure-text">
					Are you sure you want to delete selected permission{selectedPermissions.length > 1 ? "s" : ""}? This
					action is irreversible.
				</p>
				<DialogFooter border="border-none">
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Cancel
					</Button>
					<Button
						color="danger"
						isLoading={isDeletingRoles}
						disabled={isDeletingRoles}
						onClick={handleDeleteRoles}>
						Yes, Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
