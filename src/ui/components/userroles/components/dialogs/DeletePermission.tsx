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
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../../../dialog";
import { useUserRolesContext } from "../../context/UserRolesContext";
import { Role } from "../../types";

export default function DeletePermissionDialog({
	closeDialog,
	selectedPermissions,
	selectedRole,
	resetPermissions,
}: {
	closeDialog: () => void;
	selectedPermissions: string[];
	selectedRole: Role;
	resetPermissions: (permissions: string[]) => void;
}) {
	const { showToast } = useContext(PopupContentContext);
	const { roles, setRoles } = useUserRolesContext();

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
			showToast({
				iconImage: getImageUrl("checkmark-green.svg"),
				toastType: "success",
				children:
					selectedPermissions.length === 1
						? "Permission deleted successfully!"
						: "Permissions deleted successfully!",
			});
			const filteredPermissions = permissions.filter((p) => selectedPermissions.includes(p) === false);

			const updatedRolesData = roles.map((role) => {
				if (role.role === selectedRole.role) {
					role.permissions = filteredPermissions;
				}
				return role;
			});

			setRoles(updatedRolesData);
			resetPermissions(filteredPermissions);
			closeDialog();
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
		<Dialog closeDialog={closeDialog}>
			<DialogContent>
				<DialogHeader>Delete Permission?</DialogHeader>
				<p className="you-sure-text">
					Are you sure you want to delete selected permission{selectedPermissions.length > 1 ? "s" : ""}? This
					action is irreversible.
				</p>
				<DialogFooter border="border-none">
					<Button
						onClick={closeDialog}
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
