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

import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../../../dialog";
import InputField from "../../../inputField/InputField";

import useRolesService from "../../../../../api/userroles/role";
import { getImageUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import TagsInputField from "../../../inputField/TagsInputField";
import "./createNewRole.scss";

export default function CreateNewRoleDialog({
	closeDialog,
	refetchRoles,
}: {
	closeDialog: () => void;
	refetchRoles: () => void;
}) {
	const { createRole } = useRolesService();
	const { showToast } = useContext(PopupContentContext);

	const [roleError, setRoleError] = useState<string | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(false);

	const [role, setRole] = useState("");
	const [permissions, setPermissions] = useState<string[]>([]);

	async function handleCreateRole() {
		if (role.length < 1) {
			setRoleError("Please enter a valid role name!");
			return;
		}

		try {
			setIsLoading(true);
			const response = await createRole(role, permissions);

			if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: "This Feature is not enabled.",
				});
				closeDialog();
				return;
			}

			if (response.status === "OK") {
				if (response.createdNewRole === false) {
					showToast({
						iconImage: getImageUrl("form-field-error-icon.svg"),
						toastType: "error",
						children: "Role already exists!",
					});
					return;
				}

				showToast({
					iconImage: getImageUrl("checkmark-green.svg"),
					toastType: "success",
					children: "Role create successfully!",
				});
			}
			refetchRoles();
			closeDialog();
		} catch (error) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		} finally {
			setIsLoading(false);
		}
	}

	function addPermission(permission: string) {
		setPermissions([...permissions, permission]);
	}

	function removePermission(permission: string) {
		setPermissions(permissions.filter((p) => p !== permission));
	}

	return (
		<Dialog closeDialog={closeDialog}>
			<DialogContent>
				<DialogHeader>Create New Role</DialogHeader>
				<div className="create-role-dialog-container">
					<div>
						<InputField
							error={roleError}
							forceShowError={true}
							label="Name of Role"
							name="roleName"
							type="text"
							value={role}
							hideColon
							handleChange={(e) => {
								setRoleError(undefined);
								setRole(e.currentTarget.value.trim());
							}}
						/>
					</div>
					<div>
						<TagsInputField
							addTag={addPermission}
							removeTag={removePermission}
							tags={permissions}
							label="Add Permissions"
							name="permisions"
							type="text"
							focusText="Write permission name and press enter."
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						onClick={closeDialog}
						color="gray-outline">
						Go Back
					</Button>
					<Button
						isLoading={isLoading}
						disabled={isLoading}
						onClick={handleCreateRole}>
						Create now
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
