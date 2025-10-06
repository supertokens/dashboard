/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
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
import { assertNever } from "@utils/assertNever";

import RemoveAccessModal from "../modals/RemoveAccessModal";
import { useRoleUsers } from "../hooks";
import ManageAccessHeader from "./ManageAccessHeader";
import ManageAccessFooter from "./ManageAccessFooter";
import ManageAccessTable from "./ManageAccessTable";

export default function ManageAccess({ roleId }: { roleId: string }) {
	const { showSuccessToast, showErrorToast } = useToast();
	const {
		users,
		isLoading,
		error,
		refetch,
		removeUserRole,
		isRemovingUserRole,
		currentPage,
		// totalPages,
		totalCount,
		pageSize,
		hasNextPage,
		hasPreviousPage,
		goToNextPage,
		goToPreviousPage,
	} = useRoleUsers(roleId);

	const [openRemoveAccessModal, setOpenRemoveAccessModal] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	const handleRemoveUser = (userId: string) => {
		setSelectedUserId(userId);
		setOpenRemoveAccessModal(true);
	};

	const handleConfirmRemove = async () => {
		if (!selectedUserId) return;

		try {
			const response = await removeUserRole(selectedUserId);

			if (!response) {
				throw new Error("Failed to remove user role");
			}

			if (response.status === "OK") {
				showSuccessToast("User role removed successfully!");
				setOpenRemoveAccessModal(false);
				setSelectedUserId(null);
				await refetch();
			} else if (response.status === "UNKNOWN_ROLE_ERROR") {
				showErrorToast("Role not found");
			} else {
				throw new Error("Failed to remove user role");
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
			return (
				<Flex
					px="3"
					py="4"
					width="100%">
					<Loader type="list" />
				</Flex>
			);
		case "SUCCESS":
			return (
				<Flex
					width="100%"
					direction="column">
					<ManageAccessHeader />
					<ManageAccessTable
						users={users}
						onRemoveUser={handleRemoveUser}
					/>
					{totalCount > 0 && (
						<ManageAccessFooter
							currentPage={currentPage}
							totalCount={totalCount}
							pageSize={pageSize}
							hasNextPage={hasNextPage}
							hasPreviousPage={hasPreviousPage}
							onNextPage={goToNextPage}
							onPreviousPage={goToPreviousPage}
						/>
					)}
					<RemoveAccessModal
						open={openRemoveAccessModal}
						handleClose={() => {
							setOpenRemoveAccessModal(false);
							setSelectedUserId(null);
						}}
						onConfirmRemove={handleConfirmRemove}
						isRemoving={isRemovingUserRole}
					/>
				</Flex>
			);
		case "ERROR":
			return <DashboardError withBackground={false} />;
		default:
			return assertNever(pageState);
	}
}
