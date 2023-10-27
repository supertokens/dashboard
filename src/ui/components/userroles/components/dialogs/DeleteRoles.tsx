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
import { getImageUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../../../dialog";
import { useUserRolesContext } from "../../context/UserRolesContext";

import "./deleteRoles.scss";

export default function DeleteRolesDialog({
	selectedRole,
	selectedRoles,
	closeDialog,
	resetSelectedRoles,
}: {
	selectedRole: string;
	selectedRoles: string[];
	closeDialog: () => void;
	resetSelectedRoles: () => void;
}) {
	const { showToast } = useContext(PopupContentContext);
	const { roles, setRoles } = useUserRolesContext();
	const { deleteRole } = useRolesService();

	const [isDeletingRoles, setIsDeletingRoles] = useState(false);

	async function handleDeleteRoles() {
		if (typeof selectedRole !== "string") {
			return;
		}
		setIsDeletingRoles(true);

		try {
			await deleteRole(selectedRole);
			showToast({
				iconImage: getImageUrl("checkmark-green.svg"),
				toastType: "success",
				children: "Role deleted successfully!",
			});
			const filteredRoles = roles.filter((r) => {
				return r.role !== selectedRole;
			});

			setRoles(filteredRoles);
			resetSelectedRoles();
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
				<DialogHeader>Delete Roles?</DialogHeader>
				<p className="you-sure-text">
					Are you sure you want to delete Role: <span className="red">{selectedRole}</span>? This action is
					irreversible.
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
