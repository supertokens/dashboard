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
	const { showToast } = useContext(PopupContentContext);

	//	used to stores roles data from response.
	const [roles, setRoles] = useState<Role[]>([]);

	//	used to control opening and closing dialog
	const [showCreateNewRoleDialogOpen, setShowCreateNewRoleDialogOpen] = useState(false);

	//	data used to track pagination
	const [currentActivePage, setCurrentActivePage] = useState(1);
	const [paginationData, setPaginationData] = useState<PaginationData | undefined>(undefined);
	//	managed fetchRoles http loading state.
	const [isFetchingRoles, setIsFetchingRoles] = useState(false);

	const fetchRoles = async () => {
		setIsFetchingRoles(true);
		setRoles([]);
		try {
			const response = await getRoles({
				limit: USERROLES_PAGINATION_LIMIT.toString(),
				page: currentActivePage.toString(),
			});

			if (response !== undefined) {
				if (response.status === "OK" && response.totalPages !== undefined) {
					if (response.roles.length < 1 && currentActivePage !== 1) {
						setCurrentActivePage(currentActivePage - 1);
						return;
					}
					setRoles(response.roles);
					setPaginationData({
						totalRolesCount: response.totalRolesCount,
						totalPages: response.totalPages,
					});
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

	useEffect(() => {
		void fetchRoles();
	}, [currentActivePage]);

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
									refetchRoles={fetchRoles}
									onCloseDialog={() => setShowCreateNewRoleDialogOpen(false)}
								/>
							) : null}
						</div>
						<RolesTable
							setCurrentActivePage={setCurrentActivePage}
							fetchRoles={fetchRoles}
							setRoles={setRoles}
							currentActivePage={currentActivePage}
							isFetchingRoles={isFetchingRoles}
							paginationData={paginationData}
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
