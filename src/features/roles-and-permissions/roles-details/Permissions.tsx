/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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

import { useMemo, useState } from "react";
import { Flex } from "@radix-ui/themes";

import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import { useToast } from "@shared/components/toast";
import { assertNever } from "@shared/utils/assertNever";

import AddPermissionModal from "../modals/AddPermissionModal";
import DeletePermissionModal from "../modals/DeletePermissionModal";
import { usePermissions } from "../hooks";
import PermissionsHeader from "./PermissionsHeader";
import PermissionsTable from "./PermissionsTable";

export default function Permissions({ roleId }: { roleId: string }) {
	const { showSuccessToast, showErrorToast } = useToast();
	const {
		permissions,
		isLoading,
		error,
		refetch,
		addPermissions,
		removePermissions,
		isAddingPermissions,
		isRemovingPermissions,
	} = usePermissions(roleId);

	const [hoveredPermission, setHoveredPermission] = useState<string | null>(null);
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [openAddPermissionModal, setOpenAddPermissionModal] = useState(false);
	const [openDeletePermissionModal, setOpenDeletePermissionModal] = useState(false);

	const handleAddPermissions = async (newPermissions: string[]) => {
		try {
			const response = await addPermissions(newPermissions);

			if (!response) {
				throw new Error("Failed to add permissions");
			}

			if (response.status === "OK") {
				showSuccessToast("Permissions added successfully!");
				setOpenAddPermissionModal(false);
				await refetch();
			} else if (response.status === "UNKNOWN_ROLE_ERROR") {
				showErrorToast("Role not found");
			} else {
				throw new Error("Failed to add permissions");
			}
		} catch {
			showErrorToast("Something went wrong. Please try again!");
		}
	};

	const handleDeletePermissions = async () => {
		try {
			const response = await removePermissions(selectedPermissions);

			if (!response) {
				throw new Error("Failed to remove permissions");
			}

			if (response.status === "OK") {
				showSuccessToast("Permissions removed successfully!");
				setSelectedPermissions([]);
				setOpenDeletePermissionModal(false);
				await refetch();
			} else if (response.status === "UNKNOWN_ROLE_ERROR") {
				showErrorToast("Role not found");
			} else {
				throw new Error("Failed to remove permissions");
			}
		} catch {
			showErrorToast("Something went wrong. Please try again!");
		}
	};

	const pageState = useMemo(() => {
		if (isLoading) return "LOADING";
		if (error) return "ERROR";
		return "SUCCESS";
	}, [isLoading, error]);

	switch (pageState) {
		case "LOADING":
			return <Loader type="table-with-list" />;
		case "SUCCESS":
			return (
				<Flex
					direction="column"
					width="100%">
					<PermissionsHeader
						selectedPermissions={selectedPermissions}
						onAddPermission={() => setOpenAddPermissionModal(true)}
						onDeletePermissions={() => setOpenDeletePermissionModal(true)}
					/>
					<PermissionsTable
						permissions={permissions}
						hoveredPermission={hoveredPermission}
						setHoveredPermission={setHoveredPermission}
						selectedPermissions={selectedPermissions}
						setSelectedPermissions={setSelectedPermissions}
					/>
					<AddPermissionModal
						open={openAddPermissionModal}
						handleClose={() => setOpenAddPermissionModal(false)}
						existingPermissions={permissions}
						onAddPermissions={handleAddPermissions}
						isAdding={isAddingPermissions}
					/>
					<DeletePermissionModal
						open={openDeletePermissionModal}
						handleClose={() => setOpenDeletePermissionModal(false)}
						roleId={roleId}
						selectedPermissions={selectedPermissions}
						onDeletePermissions={handleDeletePermissions}
						isDeleting={isRemovingPermissions}
					/>
				</Flex>
			);
		case "ERROR":
			return <DashboardError />;
		default:
			return assertNever(pageState);
	}
}
