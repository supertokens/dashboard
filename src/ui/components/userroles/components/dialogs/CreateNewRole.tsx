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
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import InputField from "../../../inputField/InputField";

import useRolesService from "../../../../../api/userroles/role";
import { getImageUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import TagsInputField from "../../../inputField/TagsInputField";
import "./createNewRole.scss";

export default function CreateNewRoleDialog({
	onCloseDialog,
	addRoleToRawReponseData,
}: {
	onCloseDialog: () => void;
	addRoleToRawReponseData: (role: string) => void;
}) {
	const { createRoleOrUpdateARole } = useRolesService();
	const { showToast } = useContext(PopupContentContext);

	const [roleCreationError, setRoleCreationError] = useState<string | undefined>(undefined);
	const [isCreatingRole, setIsCreatingRole] = useState(false);

	const [role, setRole] = useState("");
	const [permissions, setPermissions] = useState<string[]>([]);

	async function handleCreateRole() {
		if (role.length < 1) {
			setRoleCreationError("Please enter a valid role name!");
			return;
		}

		try {
			setIsCreatingRole(true);
			const response = await createRoleOrUpdateARole(role, permissions);

			if (response !== undefined) {
				if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
					showToast({
						iconImage: getImageUrl("form-field-error-icon.svg"),
						toastType: "error",
						children: "This Feature is not enabled.",
					});
					onCloseDialog();
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
			} else {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Something went wrong Please try again!</>,
				});
			}
			addRoleToRawReponseData(role);
			onCloseDialog();
		} catch (error) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		} finally {
			setIsCreatingRole(false);
		}
	}

	return (
		<Dialog
			title="Create New Role"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<div className="create-role-dialog-container">
					<div>
						<InputField
							error={roleCreationError}
							forceShowError={true}
							label="Name of Role"
							name="roleName"
							type="text"
							value={role}
							hideColon
							handleChange={(e) => {
								setRoleCreationError(undefined);
								setRole(e.currentTarget.value.trim());
							}}
						/>
					</div>
					<div>
						<TagsInputField
							addTag={(permission: string) => {
								if (permission !== "" && permissions.includes(permission) === false) {
									setPermissions([...permissions, permission]);
								} else {
									showToast({
										iconImage: getImageUrl("form-field-error-icon.svg"),
										toastType: "error",
										children: <>Permission already exists!</>,
									});
								}
							}}
							removeTag={(permission: string) =>
								setPermissions(permissions.filter((p) => p !== permission))
							}
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
						onClick={onCloseDialog}
						color="gray-outline">
						Go Back
					</Button>
					<Button
						isLoading={isCreatingRole}
						disabled={isCreatingRole}
						onClick={handleCreateRole}>
						Create now
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
