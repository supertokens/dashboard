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
import { getImageUrl } from "../../../utils";
import Alert from "../../components/alert";
import Button from "../../components/button";
import CreateNewRole from "../../components/userroles/components/dialogs/CreateNewRole";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import "./index.scss";

export const USERROLES_PAGINATION_LIMIT = 10;

export type PaginationData = {
	totalPages: number;
	totalRolesCount: number;
};

export type RoleWithOrWithoutPermissions = {
	role: string;
	//	 undefined suggests that the permissions for this particular role is not being fetched on client.
	permissions: undefined | string[];
};

export default function UserRolesList() {
	//	boolean to check whether the roles and permissions recipe is enabled or not.
	const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean | undefined>(undefined);

	const { getRoles } = useRolesService();
	const { showToast } = useContext(PopupContentContext);

	// used to store roles with permissions data that are fetched on the client side.
	const [roles, setRoles] = useState<RoleWithOrWithoutPermissions[] | undefined>(undefined);

	//	used to control opening and closing dialog
	const [showCreateNewRoleDialogOpen, setShowCreateNewRoleDialogOpen] = useState(false);

	//	used to track active page user is on.
	const [currentActivePage, setCurrentActivePage] = useState(1);

	//	pagination related.
	const totalRolesCount = roles !== undefined ? roles.length : 0;
	const totalPages = Math.ceil(totalRolesCount / USERROLES_PAGINATION_LIMIT);

	const fetchRoles = async () => {
		try {
			const response = await getRoles();

			if (response !== undefined) {
				if (response.status === "OK") {
					//	reversing roles response to show latest roles first.
					const rolesWithUndefinedPermissions = response.roles.reverse().map((role) => {
						return {
							role,
							//	by default every role has permissions as undefined.
							permissions: undefined,
						};
					});
					setRoles(rolesWithUndefinedPermissions);
					setIsFeatureEnabled(true);
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
		}
	};

	useEffect(() => {
		//	void represent this function returns nothing.
		void fetchRoles();
	}, []);

	function renderContent() {
		if (isFeatureEnabled === false) {
			return (
				<Alert
					title="Feature is not enabled"
					content="Please enable this feature first to manage your user roles and permissions!"
				/>
			);
		}

		return (
			<>
				<div className="search-add-role-container">
					<Button
						disabled={roles === undefined}
						onClick={() => setShowCreateNewRoleDialogOpen(true)}
						color="secondary">
						<PlusIcon />
						Add Role
					</Button>
					{showCreateNewRoleDialogOpen && roles !== undefined ? (
						<CreateNewRole
							addRoleToReponseData={(role) => setRoles([role, ...roles])}
							onCloseDialog={() => setShowCreateNewRoleDialogOpen(false)}
						/>
					) : null}
				</div>
				<RolesTable
					setCurrentActivePage={setCurrentActivePage}
					setRoles={setRoles}
					currentActivePage={currentActivePage}
					paginationData={{
						totalPages,
						totalRolesCount,
					}}
					roles={roles}
				/>
			</>
		);
	}

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
				{renderContent()}
			</div>
		</AppEnvContextProvider>
	);
}
