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

import { useEffect, useState } from "react";

import Badge from "../../badge";

import { ReactComponent as TrashIcon } from "../../../../assets/trash.svg";

import { PaginationData, USERROLES_PAGINATION_LIMIT } from "../../../pages/userroles";
import Button from "../../button";
import Pagination from "../../pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";
import { PlaceholderTableRows } from "../../usersListTable/UsersListTable";
import { Role } from "../types";
import NoRolesFound from "./NoRolesFound";
import DeleteRolesDialog from "./dialogs/DeleteRoles";
import EditRoleDialog from "./dialogs/EditRole";
import "./rolesTable.scss";

type RolesTableProps = {
	roles: Role[];
	isFetchingRoles: boolean;
	currentActivePage: number;
	paginationData?: PaginationData;
	setCurrentActivePage: (page: number) => void;
	deleteRoleFromRawResponse: (role: string) => void;
	setRoles: (roles: Role[]) => void;
};

export function RolesTable({
	roles,
	isFetchingRoles,
	currentActivePage,
	paginationData,
	setCurrentActivePage,
	deleteRoleFromRawResponse,
	setRoles,
}: RolesTableProps) {
	//	used to determine what role does user have selected
	const [currentlySelectedRole, setCurrentlySelectedRole] = useState<Role | undefined>(undefined);

	//	used to control opening and closing dialog
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);

	return (
		<>
			{isFetchingRoles === false && roles.length < 1 && currentActivePage === 1 ? (
				<NoRolesFound />
			) : (
				<div className="margin-bottom-36">
					<Table
						className="theme-blue"
						pagination={
							paginationData !== undefined ? (
								<Pagination
									className="roles-list-pagination"
									handleNext={() => setCurrentActivePage(currentActivePage + 1)}
									handlePrevious={() => setCurrentActivePage(currentActivePage - 1)}
									limit={USERROLES_PAGINATION_LIMIT}
									currentActivePage={currentActivePage}
									totalPages={paginationData.totalPages}
									offset={roles.length}
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
							{roles.map(({ role, permissions }, index) => {
								return (
									<TableRow
										key={role}
										onClick={(e) => {
											setCurrentlySelectedRole(roles[index]);
											setShowEditDialog(true);
										}}>
										<TableCell>{role}</TableCell>
										<TableCell>
											<div className="permissions-container">
												<Permissions permissions={permissions} />
												<button
													onClick={(e) => {
														e.stopPropagation();
														setShowDeleteDialog(true);
														setCurrentlySelectedRole(roles[index]);
													}}
													className="delete-role">
													<TrashIcon />
												</button>
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
					{showDeleteDialog && currentlySelectedRole !== undefined ? (
						<DeleteRolesDialog
							deleteRoleFromRawResponse={deleteRoleFromRawResponse}
							onCloseDialog={() => setShowDeleteDialog(false)}
							currentlySelectedRoleName={currentlySelectedRole.role}
						/>
					) : null}
					{showEditDialog && currentlySelectedRole !== undefined ? (
						<EditRoleDialog
							roles={roles}
							setRoles={setRoles}
							currentlySelectedRole={currentlySelectedRole}
							onCloseDialog={() => setShowEditDialog(false)}
						/>
					) : null}
				</div>
			)}
		</>
	);
}

function Permissions({ permissions }: { permissions: string[] }) {
	const [badgeRenderLimit, setBadgeRenderLimit] = useState(4);

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

		handleResizeEvent();
		window.addEventListener("resize", handleResizeEvent);

		() => {
			window.removeEventListener("resize", handleResizeEvent);
		};
	}, []);

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
