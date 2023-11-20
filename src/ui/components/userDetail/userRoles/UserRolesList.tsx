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
import { ReactComponent as CrossIcon } from "../../../../assets/cross.svg";
import { ReactComponent as PlusSquareIcon } from "../../../../assets/plus-square.svg";
import Badge from "../../badge";
import { LayoutPanel } from "../../layout/layoutPanel";
import { UserRolesListHeader } from "./UserRolesListHeader";

import Alert from "../../alert";
import AssignRolesDialog from "../../userroles/components/dialogs/AssignRoles";
import DeleteUserRoleDialog from "../../userroles/components/dialogs/DeleteUserRole";
import "./userRolesList.scss";

type UserRolesListProps = {
	roles: string[] | undefined;
	userId: string;
	isFeatureEnabled: boolean | undefined;
};

export default function UserRolesList(props: UserRolesListProps) {
	const { roles, userId } = props;

	const [assignedRoles, setAssignedRoles] = useState<string[] | undefined>(roles);

	const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
	const [roleToDelete, setRoleToDelete] = useState<undefined | string>(undefined);
	const [showDeleteRoleDialog, setShowDeleteDialogRole] = useState(true);

	const [isEditing, setIsEditing] = useState(false);

	function renderContent() {
		if (isEditing === true) {
			return (
				<div className="roles-list-container">
					{assignedRoles !== undefined &&
						assignedRoles.map((role) => {
							return (
								<Badge
									key={role}
									type="success"
									text={role}>
									<CrossIcon
										onClick={() => {
											setRoleToDelete(role);
											setShowDeleteDialogRole(true);
										}}
									/>
								</Badge>
							);
						})}
					<button
						className="add-role-btn"
						onClick={() => setShowAddRoleDialog(true)}>
						Assign Role <PlusSquareIcon />
					</button>
				</div>
			);
		}

		return (
			<div className="roles-list-container">
				{assignedRoles !== undefined && assignedRoles.length < 1 ? (
					<button
						data-disable-hover="true"
						className="add-role-btn">
						No assigned User Roles
					</button>
				) : null}
				{assignedRoles !== undefined &&
					assignedRoles.map((role) => {
						return (
							<Badge
								key={role}
								type="success"
								text={role}
							/>
						);
					})}
			</div>
		);
	}

	if (props.isFeatureEnabled !== undefined && props.isFeatureEnabled === false) {
		return (
			<Alert
				title="Feature is not enabled"
				content="Please enable this feature first to manage your user roles and permissions!"
			/>
		);
	}

	return (
		<LayoutPanel
			header={
				<UserRolesListHeader
					setIsEditing={setIsEditing}
					isEditing={isEditing}
					isFeatureEnabled={props.isFeatureEnabled}
				/>
			}
			headerBorder>
			<>
				<div className="user-roles-list-wrapper">{renderContent()}</div>
				{assignedRoles !== undefined && showAddRoleDialog ? (
					<AssignRolesDialog
						userId={userId}
						assignedRoles={assignedRoles}
						setAssignedRoles={setAssignedRoles}
						onCloseDialog={() => setShowAddRoleDialog(false)}
					/>
				) : null}
				{assignedRoles !== undefined && showDeleteRoleDialog && roleToDelete !== undefined ? (
					<DeleteUserRoleDialog
						roleToDelete={roleToDelete}
						userId={userId}
						assignedRoles={assignedRoles}
						setAssignedRoles={setAssignedRoles}
						onCloseDialog={() => {
							setRoleToDelete(undefined);
							setShowDeleteDialogRole(false);
						}}
					/>
				) : null}
			</>
		</LayoutPanel>
	);
}
