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

import { AppEnvContextProvider } from "../../contexts/AppEnvContext";

import { ReactComponent as PlusIcon } from "../../../assets/plus.svg";
import { RolesTable } from "../../components/userroles/components/RolesTable";

import useRolesService from "../../../api/userroles/role";
import { usePermissionsService } from "../../../api/userroles/role/permissions";
import { getImageUrl } from "../../../utils";
import Alert from "../../components/alert";
import Button from "../../components/button";
import CreateNewRole from "../../components/userroles/components/dialogs/CreateNewRole";
import { Role } from "../../components/userroles/types";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import "./index.scss";

export const USERROLES_PAGINATION_LIMIT = 10;

export type PaginationData = {
	totalPages: number;
	totalRolesCount: number;
};

export default function UserRolesList() {
	//	boolean to check whether the roles and permissions recipe is enabled or not.
	const [isFeatureEnabled, setIsFeatureEnabled] = useState(true);

	const { getRoles } = useRolesService();
	const { getPermissionsForRole } = usePermissionsService();
	const { showToast } = useContext(PopupContentContext);

	//	used to stores raw roles which is only array of role names data from response.
	const [rolesRawResponse, setRolesRawResponse] = useState<string[]>([]);
	// used to store roles with permissions data that are fetched on the client side.
	const [roles, setRoles] = useState<Role[]>([]);

	//	used to control opening and closing dialog
	const [showCreateNewRoleDialogOpen, setShowCreateNewRoleDialogOpen] = useState(false);

	//	used to track active page user is on.
	const [currentActivePage, setCurrentActivePage] = useState(1);
	//	managed fetchRoles http loading state.
	const [isFetchingRoles, setIsFetchingRoles] = useState(true);

	//	pagination related.
	const totalRolesCount = rolesRawResponse.length;
	const totalPages = Math.ceil(rolesRawResponse.length / USERROLES_PAGINATION_LIMIT);
	//	skip will decide how many results should be skipped based on the active page number.
	const rolesToSkip = USERROLES_PAGINATION_LIMIT * (currentActivePage - 1);

	const fetchRoles = async () => {
		try {
			const response = await getRoles();

			if (response !== undefined) {
				if (response.status === "OK") {
					//	reversing roles response to show latest roles first.
					setRolesRawResponse(response.roles.reverse());
				}

				if (response.status === "FEATURE_NOT_ENABLED_ERROR") {
					setIsFeatureEnabled(false);
				}
			} else {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Something went wrong Please try again!</>,
				});
			}
		} catch (_) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		} finally {
			setIsFetchingRoles(false);
		}
	};

	async function fetchPermissionsForRoles() {
		setIsFetchingRoles(true);
		setRoles([]);
		const rolesWithPermissions: Role[] = [];
		//	client side pagination.
		const paginatedRoles = rolesRawResponse.slice(rolesToSkip, rolesToSkip + USERROLES_PAGINATION_LIMIT);
		for (let i = 0; i < paginatedRoles.length; i++) {
			const response = await getPermissionsForRole(paginatedRoles[i]);
			if (response?.status === "OK") {
				rolesWithPermissions.push({
					role: paginatedRoles[i],
					permissions: response.permissions,
				});
			} else {
				throw new Error("This should never happen.");
			}
			await new Promise((res) => setTimeout(res, 250));
		}
		setRoles(rolesWithPermissions);
		setIsFetchingRoles(false);
	}

	useEffect(() => {
		//	only refetch the permissions when the roleRawResponse and currentActivePage changes.
		if (rolesRawResponse.length > 0) {
			void fetchPermissionsForRoles();
		}
	}, [currentActivePage, rolesRawResponse]);

	useEffect(() => {
		//	void represent this function returns nothing.
		void fetchRoles();
	}, []);

	return (
		<AppEnvContextProvider
			connectionURI={
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(window as any).connectionURI
			}>
			<div className="userroles-container">
				<h1 className="users-list-title">Roles and Permissions</h1>
				<p className="text-small users-list-subtitle">
					One place to manage all your user roles and permissions. Edit roles and permissions according to
					your needs.
				</p>
				{isFeatureEnabled ? (
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
									addRoleToRawReponseData={(role) => setRolesRawResponse([role, ...rolesRawResponse])}
									onCloseDialog={() => setShowCreateNewRoleDialogOpen(false)}
								/>
							) : null}
						</div>
						<RolesTable
							deleteRoleFromRawResponse={(role: string) =>
								setRolesRawResponse(rolesRawResponse.filter((r) => r !== role))
							}
							setCurrentActivePage={setCurrentActivePage}
							setRoles={setRoles}
							currentActivePage={currentActivePage}
							isFetchingRoles={isFetchingRoles}
							paginationData={{
								totalPages,
								totalRolesCount,
							}}
							roles={roles}
						/>
					</>
				) : (
					<Alert
						title="Feature is not enabled"
						content="Please enable this feature first to manage your user roles and permissions!"
					/>
				)}
			</div>
		</AppEnvContextProvider>
	);
}
