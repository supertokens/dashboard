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

import { useContext, useEffect, useState } from "react";

import { ReactComponent as TrashIcon } from "../../../../assets/trash.svg";

import { usePermissionsService } from "../../../../api/userroles/role/permissions";
import { getImageUrl } from "../../../../utils";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import { PaginationData, RoleWithOrWithoutPermissions, USERROLES_PAGINATION_LIMIT } from "../../../pages/userroles";
import Badge from "../../badge";
import Button from "../../button";
import Pagination from "../../pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";
import { PlaceholderTableRows } from "../../usersListTable/UsersListTable";
import NoRolesFound from "./NoRolesFound";
import DeleteRoleDialog from "./dialogs/DeleteRole";
import EditRoleDialog from "./dialogs/EditRole";
import "./rolesTable.scss";

type SetRoles = (roles: RoleWithOrWithoutPermissions[]) => void;

type RolesTableProps = {
	roles: RoleWithOrWithoutPermissions[] | undefined;
	setRoles: SetRoles;
	isFetchingRoles: boolean;
	currentActivePage: number;
	paginationData: PaginationData;
	setCurrentActivePage: (page: number) => void;
};

export function RolesTable({
	roles,
	isFetchingRoles,
	currentActivePage,
	paginationData,
	setCurrentActivePage,
	setRoles,
}: RolesTableProps) {
	//	skip will decide how many results should be skipped based on the active page number.
	const rolesToSkip = USERROLES_PAGINATION_LIMIT * (currentActivePage - 1);
	const paginatedRoles = roles?.slice(rolesToSkip, rolesToSkip + USERROLES_PAGINATION_LIMIT);

	useEffect(() => {
		//	if the role is deleted and the role is in the last page of pagination and not the first page
		//	we should set currentPage to previous as this page not have any results now.
		if (currentActivePage !== 1 && paginatedRoles?.length === 0) {
			setCurrentActivePage(currentActivePage - 1);
		}
	}, [roles]);

	if (isFetchingRoles === false && roles !== undefined && roles?.length === 0) {
		return <NoRolesFound />;
	}

	return (
		<div className="margin-bottom-36">
			<Table
				className="theme-blue"
				pagination={
					isFetchingRoles === false && paginatedRoles !== undefined ? (
						<Pagination
							className="roles-list-pagination"
							handleNext={() => setCurrentActivePage(currentActivePage + 1)}
							handlePrevious={() => setCurrentActivePage(currentActivePage - 1)}
							limit={USERROLES_PAGINATION_LIMIT}
							currentActivePage={currentActivePage}
							totalPages={paginationData.totalPages}
							offset={paginatedRoles.length}
							totalItems={paginationData.totalRolesCount}
						/>
					) : null
				}>
				<TableHeader>
					<TableRow>
						<TableHead className="roles-column">User Roles</TableHead>
						<TableHead>
							<div className="delete-btn-container">Permissions</div>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isFetchingRoles ? (
						<PlaceholderTableRows
							rowCount={14}
							colSpan={3}
							className={"user-info"}
						/>
					) : null}
					{roles !== undefined &&
						paginatedRoles?.map(({ role, permissions }) => {
							return (
								<RolesTableRow
									permissions={permissions}
									role={role}
									roles={roles}
									setRoles={setRoles}
									key={role}
								/>
							);
						})}
				</TableBody>
			</Table>
		</div>
	);
}

type RolesTableRowProps = {
	permissions: string[] | undefined;
	role: string;
	roles: RoleWithOrWithoutPermissions[];
	setRoles: SetRoles;
};

function RolesTableRow({ permissions, role, roles, setRoles }: RolesTableRowProps) {
	//	used to control opening and closing dialog
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);

	function setPermissionsToARole(role: string, permissions: string[]) {
		if (roles !== undefined) {
			const updatedRoleWithPermissions = roles.map((r) => {
				if (r.role === role) {
					r.permissions = permissions;
				}
				return r;
			});
			setRoles(updatedRoleWithPermissions);
		}
	}

	return (
		<>
			<TableRow
				className={permissions === undefined ? "disable-row" : undefined}
				key={role}
				onClick={() => {
					setShowEditDialog(true);
				}}>
				<TableCell>{role}</TableCell>
				<TableCell>
					<div className="permissions-container">
						<Permissions
							role={role}
							permissions={permissions}
							setPermissionToARole={setPermissionsToARole}
						/>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setShowDeleteDialog(true);
							}}
							className="delete-role">
							<TrashIcon />
						</button>
					</div>
				</TableCell>
			</TableRow>
			{showDeleteDialog ? (
				<DeleteRoleDialog
					deleteRole={(role: string) => {
						const filteredRoles = roles.filter((r) => r.role !== role);
						setRoles(filteredRoles);
					}}
					onCloseDialog={() => setShowDeleteDialog(false)}
					currentlySelectedRoleName={role}
				/>
			) : null}
			{showEditDialog ? (
				<EditRoleDialog
					roles={roles}
					setRoles={setRoles}
					currentlySelectedRole={{
						role,
						permissions,
					}}
					onCloseDialog={() => {
						setShowEditDialog(false);
					}}
				/>
			) : null}
		</>
	);
}

function Permissions({
	permissions,
	role,
	setPermissionToARole,
}: {
	permissions: string[] | undefined;
	role: string;
	setPermissionToARole: (role: string, permissions: string[]) => void;
}) {
	const { showToast } = useContext(PopupContentContext);
	const [badgeRenderLimit, setBadgeRenderLimit] = useState(4);
	const { getPermissionsForRole } = usePermissionsService();

	async function fetchPermissionsForRoles() {
		if (permissions === undefined) {
			try {
				const response = await getPermissionsForRole(role);
				if (response?.status === "OK") {
					setPermissionToARole(role, response.permissions);
				} else if (response?.status === "FEATURE_NOT_ENABLED_ERROR") {
					showToast({
						iconImage: getImageUrl("form-field-error-icon.svg"),
						toastType: "error",
						children: <>Feature not enabled!</>,
					});
				} else if (response?.status === "UNKNOWN_ROLE_ERROR") {
					showToast({
						iconImage: getImageUrl("form-field-error-icon.svg"),
						toastType: "error",
						children: <>This role doesn't exists!</>,
					});
				}
			} catch (_) {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Something went wrong Please try again!</>,
				});
			}
		}
	}

	useEffect(() => {
		function handleResizeEvent() {
			const matchesTablet = window.matchMedia("(min-width: 768px)");
			const matchesMobile = window.matchMedia("(min-width: 568px)");

			if (matchesMobile.matches === false) {
				setBadgeRenderLimit(1);
			} else if (matchesTablet.matches === false) {
				setBadgeRenderLimit(2);
			} else {
				setBadgeRenderLimit(4);
			}
		}

		window.addEventListener("resize", handleResizeEvent);
		void fetchPermissionsForRoles();
		() => {
			//	cleanup
			window.removeEventListener("resize", handleResizeEvent);
		};
	}, []);

	if (permissions === undefined) {
		return <div>Loading...</div>;
	}

	return (
		<div
			id="permissions"
			className="permissions">
			{permissions.slice(0, badgeRenderLimit).map((permission) => {
				return (
					<Badge
						className="badge-width"
						key={permission}
						text={permission}
					/>
				);
			})}
			{badgeRenderLimit < permissions.length ? (
				<Button
					size="sm"
					color="info">
					...
				</Button>
			) : null}
			{permissions.length < 1 ? (
				<Button
					color="info"
					size="xs">
					No Permissions
				</Button>
			) : null}
		</div>
	);
}
