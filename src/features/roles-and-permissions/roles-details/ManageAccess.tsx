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

import { useContext, useMemo, useState } from "react";
import { Flex, IconButton, Text } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import ItemLabel from "@shared/components/itemLabel";
import EmptyList from "@shared/components/empty";
import Paper from "@shared/components/paper";
import Button from "@shared/components/button";
import { PopupContentContext } from "@contexts/PopupContentContext";
import { assertNever } from "@utils/assertNever";
import { getImageUrl } from "@utils/index";
import { User } from "@features/users/types";

import RemoveAccessModal from "../modals/removeAccess";
import { useRoleUsers } from "../hooks";

import "./ManageAccess.module.scss";

const ManageAccessHeader = () => {
	return (
		<Flex
			className="manage-access__header"
			px="3"
			py="4">
			<ItemLabel>List of users who have access to this role</ItemLabel>
		</Flex>
	);
};

interface ManageAccessFooterProps {
	currentPage: number;
	totalCount: number;
	pageSize: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onNextPage: () => void;
	onPreviousPage: () => void;
}

const ManageAccessFooter = ({
	currentPage,
	totalCount,
	pageSize,
	hasNextPage,
	hasPreviousPage,
	onNextPage,
	onPreviousPage,
}: ManageAccessFooterProps) => {
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, totalCount);

	return (
		<Flex
			align="center"
			justify="end"
			gap="3"
			px="3"
			my="4">
			<Text
				size="2"
				weight="medium">
				{totalCount > 0 ? `${startIndex} - ${endIndex} of ${totalCount}` : "0 of 0"}
			</Text>
			<Flex gap="3">
				<IconButton
					size="2"
					variant="soft"
					color="gray"
					disabled={!hasPreviousPage}
					onClick={onPreviousPage}>
					<ChevronLeftIcon />
				</IconButton>
				<IconButton
					size="2"
					variant="soft"
					color="gray"
					disabled={!hasNextPage}
					onClick={onNextPage}>
					<ChevronRightIcon />
				</IconButton>
			</Flex>
		</Flex>
	);
};

interface ManageAccessTableProps {
	users: User[];
	onRemoveUser: (userId: string) => void;
}

const ManageAccessTable = ({ users, onRemoveUser }: ManageAccessTableProps) => {
	if (users.length === 0) {
		return (
			<Flex
				px="3"
				py="4"
				justify="center"
				align="center"
				width="100%">
				<EmptyList
					iconUrl="user.svg"
					title="No users assigned"
					description="This role has not been assigned to any user yet"
				/>
			</Flex>
		);
	}

	return (
		<Paper
			className="manage-access__table"
			withBorder={true}
			mx="3"
			my="4"
			p="0">
			<Flex
				direction="column"
				className="manage-access__table__items">
				{users.map((user) => (
					<Flex
						align="center"
						key={user.id}
						justify="between"
						className="manage-access__table__item"
						p="3">
						<Flex
							direction="column"
							gap="1">
							<Text
								size="3"
								weight="medium">
								{user.firstName} {user.lastName}
							</Text>
							{user.emails[0] && (
								<Text
									size="2"
									weight="medium"
									color="gray">
									{user.emails[0]}
								</Text>
							)}
							{user.phoneNumbers[0] && (
								<Text
									size="2"
									weight="medium"
									color="gray">
									{user.phoneNumbers[0]}
								</Text>
							)}
						</Flex>
						<Button
							size="2"
							variant="outline"
							color="gray"
							onClick={() => onRemoveUser(user.id)}>
							Remove
						</Button>
					</Flex>
				))}
			</Flex>
		</Paper>
	);
};

export default function ManageAccess({ roleId }: { roleId: string }) {
	const { showToast } = useContext(PopupContentContext);
	const {
		users,
		isLoading,
		error,
		refetch,
		removeUserRole,
		isRemovingUserRole,
		currentPage,
		totalPages,
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
				showToast({
					iconImage: getImageUrl("checkmark-green.svg"),
					toastType: "success",
					children: <>User role removed successfully!</>,
				});
				setOpenRemoveAccessModal(false);
				setSelectedUserId(null);
				await refetch();
			} else if (response.status === "UNKNOWN_ROLE_ERROR") {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Role not found</>,
				});
			} else {
				throw new Error("Failed to remove user role");
			}
		} catch {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong. Please try again!</>,
			});
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
