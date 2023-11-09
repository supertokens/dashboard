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

import useRolesService from "../../../../api/userroles/role";
import { ReactComponent as PlusIcon } from "../../../../assets/plus.svg";
import Badge from "../../badge";

import { ReactComponent as TrashIcon } from "../../../../assets/trash.svg";

import { getImageUrl } from "../../../../utils";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import Button from "../../button";
import Pagination from "../../pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";
import { PlaceholderTableRows } from "../../usersListTable/UsersListTable";
import { useUserRolesContext } from "../context/UserRolesContext";
import { Role } from "../types";
import NoRolesFound from "./NoRolesFound";
import CreateNewRole from "./dialogs/CreateNewRole";
import DeleteRolesDialog from "./dialogs/DeleteRoles";
import EditRoleDialog from "./dialogs/EditRole";
import "./rolesTable.scss";

const PAGINATION_LIMIT = 10;

export function RolesTable({ setIsFeatureEnabled }: { setIsFeatureEnabled: (value: boolean) => void }) {
	const { getRoles } = useRolesService();
	const { showToast } = useContext(PopupContentContext);
	const { roles, setRoles } = useUserRolesContext();

	const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showCreateNewRoleDialogOpen, setShowCreateNewRoleDialogOpen] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [rolesCount, setRolesCount] = useState(0);

	const [isLoading, setIsLoading] = useState(false);

	const fetchRoles = async () => {
		setIsLoading(true);
		setRoles([]);
		try {
			const response = await getRoles({ limit: PAGINATION_LIMIT.toString(), page: page.toString() });

			if (response.status === "OK" && response.totalPages !== undefined) {
				if (response.roles.length < 1 && page !== 1) {
					setPage(page - 1);
					return;
				}
				setRoles(response.roles);
				setTotalPages(response.totalPages);
				setRolesCount(response.rolesCount);
			}

			if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
				setIsFeatureEnabled(false);
			}
		} catch (_) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		void fetchRoles();
	}, [page]);

	return (
		<>
			<div className="search-add-role-container">
				<Button
					onClick={() => setShowCreateNewRoleDialogOpen(true)}
					color="secondary">
					<PlusIcon />
					Add Role
				</Button>
				{showCreateNewRoleDialogOpen ? (
					<CreateNewRole
						refetchRoles={fetchRoles}
						closeDialog={() => setShowCreateNewRoleDialogOpen(false)}
					/>
				) : null}
			</div>
			{isLoading === false && roles.length < 1 && page === 1 ? (
				<NoRolesFound />
			) : (
				<div className="margin-bottom-36">
					<Table
						className="theme-blue"
						pagination={
							isLoading === false ? (
								<Pagination
									className="roles-list-pagination"
									handleNext={() => setPage(page + 1)}
									handlePrevious={() => setPage(page - 1)}
									isLoading={isLoading}
									limit={PAGINATION_LIMIT}
									page={page}
									totalPages={totalPages}
									offset={roles.length}
									totalItems={rolesCount}
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
							{isLoading ? (
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
											setSelectedRole(roles[index]);
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
														setSelectedRole(roles[index]);
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
					{showDeleteDialog && selectedRole ? (
						<DeleteRolesDialog
							refetchRoles={fetchRoles}
							closeDialog={() => setShowDeleteDialog(false)}
							selectedRole={selectedRole?.role}
						/>
					) : null}
					{showEditDialog && selectedRole ? (
						<EditRoleDialog
							selectedRole={selectedRole}
							closeDialog={() => setShowEditDialog(false)}
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
