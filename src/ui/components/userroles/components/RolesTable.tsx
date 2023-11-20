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

import { ReactComponent as RefreshIcon } from "../../../../assets/refresh.svg";
import { ReactComponent as TrashIcon } from "../../../../assets/trash.svg";

import { usePermissionsService } from "../../../../api/userroles/role/permissions";
import { getImageUrl } from "../../../../utils";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import { PaginationData, RoleWithOrWithoutPermissions, USERROLES_PAGINATION_LIMIT } from "../../../pages/userroles";
import Badge from "../../badge";
import Button from "../../button";
import Pagination from "../../pagination";
import Shimmer from "../../shimmer";
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

	if (isFetchingRoles === true) {
		return (
			<div className="margin-bottom-36">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="roles-column">User Roles</TableHead>
							<TableHead>
								<div className="delete-btn-container">Permissions</div>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<PlaceholderTableRows
							rowCount={14}
							colSpan={3}
							className={"user-info"}
						/>
					</TableBody>
				</Table>
			</div>
		);
	}

	return (
		<div className="margin-bottom-36">
			<Table
				className="theme-blue"
				pagination={
					<Pagination
						className="roles-list-pagination"
						handleNext={() => setCurrentActivePage(currentActivePage + 1)}
						handlePrevious={() => setCurrentActivePage(currentActivePage - 1)}
						limit={USERROLES_PAGINATION_LIMIT}
						currentActivePage={currentActivePage}
						totalPages={paginationData.totalPages}
						offset={paginatedRoles?.length || 0}
						totalItems={paginationData.totalRolesCount}
					/>
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
	const { showToast } = useContext(PopupContentContext);
	//	used to control opening and closing dialog
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);

	//	fetchPermissions network states
	const [isErrorWhileFetchingPermissions, setIsErrorWhileFetchingPermissions] = useState(false);
	const [isFetchingPermissions, setIsFetchingPermissions] = useState(false);

	//	to determine how many permissions fits into the row for given screen width.
	const [badgeRenderLimit, setBadgeRenderLimit] = useState(4);
	const { getPermissionsForRole } = usePermissionsService();

	async function fetchPermissionsForRoles() {
		//	only fetch permissions when the permissions are undefined for a give role
		//
		if (permissions === undefined) {
			try {
				setIsFetchingPermissions(true);
				setIsErrorWhileFetchingPermissions(false);
				const response = await getPermissionsForRole(role);
				if (response?.status === "OK") {
					if (roles !== undefined) {
						const updatedRoleWithPermissions = roles.map((r) => {
							if (r.role === role) {
								r.permissions = response.permissions;
							}
							return r;
						});
						setRoles(updatedRoleWithPermissions);
					}
				} else if (response?.status === "UNKNOWN_ROLE_ERROR") {
					showToast({
						iconImage: getImageUrl("form-field-error-icon.svg"),
						toastType: "error",
						children: <>This role does not exists!</>,
					});
				}
			} catch (_) {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Something went wrong Please try again!</>,
				});
				setIsErrorWhileFetchingPermissions(true);
			} finally {
				setIsFetchingPermissions(false);
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

	function renderPermissions() {
		if (isErrorWhileFetchingPermissions) {
			return (
				<div style={{ color: "#ED344E" }}>
					<img
						src={getImageUrl("form-field-error-icon.svg")}
						alt="alert icon"
					/>{" "}
					Something went wrong!
				</div>
			);
		}

		if (isFetchingPermissions) {
			return <Shimmer />;
		}

		return (
			<>
				{permissions !== undefined ? (
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
				) : null}
			</>
		);
	}

	return (
		<>
			<TableRow
				className={isFetchingPermissions ? "disable-row" : undefined}
				key={role}
				onClick={() => {
					setShowEditDialog(true);
				}}>
				<TableCell>{role}</TableCell>
				<TableCell>
					<div className="permissions-container">
						{renderPermissions()}
						{isErrorWhileFetchingPermissions ? (
							<button
								className="refresh-btn"
								onClick={(e) => {
									e.stopPropagation();
									void fetchPermissionsForRoles();
								}}>
								<RefreshIcon />
							</button>
						) : (
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowDeleteDialog(true);
								}}
								className="delete-role">
								<TrashIcon />
							</button>
						)}
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
			{showEditDialog && permissions !== undefined ? (
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
