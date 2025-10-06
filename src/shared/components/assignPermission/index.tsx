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

import { useState, useMemo } from "react";
import { Cross1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Badge, Flex, Text, TextField } from "@radix-ui/themes";

import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import EmptyList from "@shared/components/empty";
import Form from "@shared/components/form";
import CheckboxGroup from "../checkboxGroup";

import "./index.scss";

interface ReviewSelectionProps {
	selectedExisting: string[];
	newPermissions: string[];
}

const ReviewSelection = ({ selectedExisting, newPermissions }: ReviewSelectionProps) => {
	const totalSelected = selectedExisting.length + newPermissions.length;

	if (totalSelected === 0) {
		return null;
	}

	return (
		<Form.Paper
			p="0"
			className="permissions__review-selection">
			<Flex
				className="permissions__review-selection__header"
				gap="2">
				<Text className="permissions__review-selection__header__title">Review Selection</Text>
				<Badge
					radius="full"
					size="1"
					className="permissions__review-selection__header__badge">
					{totalSelected} selected
				</Badge>
			</Flex>
			<Flex className="permissions__review-selection__content">
				{selectedExisting.length > 0 && (
					<Flex
						className="permissions__review-selection__content__existing"
						direction="column"
						gap="3">
						<Text className="permissions__review-selection__content__existing__title">
							<Text
								size="2"
								weight="medium">
								Existing ({selectedExisting.length})
							</Text>
						</Text>

						<Flex
							gap="3"
							wrap="wrap">
							{selectedExisting.map((item) => (
								<Badge
									size="1"
									radius="medium"
									key={item}
									variant="soft"
									color="gray">
									<Text
										className="permissions__review-selection__content__existing__badge"
										size="2"
										weight="medium">
										{item}
									</Text>
								</Badge>
							))}
						</Flex>
					</Flex>
				)}
				{newPermissions.length > 0 && (
					<Flex
						className="permissions__review-selection__content__new"
						direction="column"
						gap="3">
						<Text className="permissions__review-selection__content__new__title">
							<Text
								size="2"
								weight="medium">
								New ({newPermissions.length})
							</Text>
						</Text>
						<Flex
							gap="3"
							wrap="wrap">
							{newPermissions.map((item) => (
								<Badge
									size="1"
									radius="medium"
									key={item}
									variant="soft">
									<Text
										className="permissions__review-selection__content__new__badge"
										size="2"
										weight="medium">
										{item}
									</Text>
								</Badge>
							))}
						</Flex>
					</Flex>
				)}
			</Flex>
		</Form.Paper>
	);
};

interface AssignPermissionProps {
	availablePermissions?: string[];
	onPermissionsChange?: (permissions: string[]) => void;
	disabled?: boolean;
}

export const AssignPermission = ({
	availablePermissions = [],
	onPermissionsChange,
	disabled = false,
}: AssignPermissionProps) => {
	const [availablePermissionsStatus] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");
	const [searchQuery, setSearchQuery] = useState("");
	const [newPermissionInput, setNewPermissionInput] = useState("");
	const [newPermissions, setNewPermissions] = useState<string[]>([]);
	const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);

	const filteredAvailablePermissions = useMemo(() => {
		if (!searchQuery.trim()) return availablePermissions;
		const query = searchQuery.toLowerCase();
		return availablePermissions.filter((p) => p.toLowerCase().includes(query));
	}, [availablePermissions, searchQuery]);

	const handleAddNewPermission = () => {
		const trimmed = newPermissionInput.trim();
		if (trimmed && !newPermissions.includes(trimmed) && !availablePermissions.includes(trimmed)) {
			const updated = [...newPermissions, trimmed];
			setNewPermissions(updated);
			setNewPermissionInput("");

			// Notify parent of all selected permissions
			if (onPermissionsChange) {
				onPermissionsChange([...selectedAvailable, ...updated]);
			}
		}
	};

	const handleRemoveNewPermission = (permission: string) => {
		const updated = newPermissions.filter((p) => p !== permission);
		setNewPermissions(updated);

		// Notify parent of all selected permissions
		if (onPermissionsChange) {
			onPermissionsChange([...selectedAvailable, ...updated]);
		}
	};

	const handleAvailableSelectionChange = (selected: string[]) => {
		setSelectedAvailable(selected);

		// Notify parent of all selected permissions
		if (onPermissionsChange) {
			onPermissionsChange([...selected, ...newPermissions]);
		}
	};

	const renderAvailablePermissions = () => {
		return (
			<Flex
				direction="column"
				className="permissions__existing-permissions">
				<Text
					size="3"
					weight="bold"
					className="permissions__existing-permissions__title">
					Assign Existing Permissions
				</Text>
				{(() => {
					switch (availablePermissionsStatus) {
						case "LOADING":
							return (
								<Flex p="4">
									<Loader type="list" />
								</Flex>
							);

						case "SUCCESS":
							return (
								<Flex
									width="100%"
									px="4"
									py="3"
									gap="3"
									direction="column">
									<TextField.Root
										placeholder="Search Permissions"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										disabled={disabled}
										className="permissions__existing-permissions__search">
										<TextField.Slot>
											<MagnifyingGlassIcon />
										</TextField.Slot>
									</TextField.Root>

									{filteredAvailablePermissions.length === 0 ? (
										<EmptyList
											iconUrl="permission.svg"
											title="No permissions found"
											description={
												searchQuery
													? "No permissions match your search"
													: "No available permissions"
											}
										/>
									) : (
										<CheckboxGroup.Root
											value={selectedAvailable}
											onValueChange={handleAvailableSelectionChange}
											name="available-permissions"
											className="permissions__existing-permissions__list-items">
											{filteredAvailablePermissions.map((item) => (
												<CheckboxGroup.Item
													key={item}
													disabled={disabled}
													className="permissions__existing-permissions__list-items__item"
													value={item}>
													<Text
														size="2"
														weight="regular">
														{item}
													</Text>
												</CheckboxGroup.Item>
											))}
										</CheckboxGroup.Root>
									)}
								</Flex>
							);
						case "ERROR":
							return <DashboardError withBackground={false} />;
					}
				})()}
			</Flex>
		);
	};

	const renderCreateNewPermissions = () => {
		return (
			<Flex
				direction="column"
				className="permissions__create-new-permissions">
				<Text
					size="3"
					weight="bold"
					className="permissions__create-new-permissions__title">
					Create New Permissions
				</Text>
				<Flex
					direction="column"
					gap="2"
					px="4"
					py="3"
					className="permissions__create-new-permissions__search">
					<TextField.Root
						placeholder="Enter Permission Name"
						value={newPermissionInput}
						onChange={(e) => setNewPermissionInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleAddNewPermission();
							}
						}}
						disabled={disabled}
					/>
					<Text
						size="1"
						weight="medium"
						className="permissions__create-new-permissions__search__guide">
						Press "Enter" to add the permission
					</Text>
				</Flex>

				{newPermissions.length === 0 ? (
					<EmptyList
						iconUrl="permission.svg"
						title={
							<Text
								size="1"
								weight="medium"
								className="permissions__create-new-permissions__empty">
								No new permissions created
							</Text>
						}
						description={
							<Text
								size="1"
								weight="medium"
								className="permissions__create-new-permissions__empty-description">
								Create new permissions by entering the permission name and pressing 'Enter'
							</Text>
						}
					/>
				) : (
					<Flex
						className="permissions__create-new-permissions__list"
						direction="column"
						gap="2"
						px="4"
						py="3">
						{newPermissions.map((permission) => (
							<Badge
								variant="soft"
								size="3"
								key={permission}
								className="permissions__create-new-permissions__list__item">
								<Text
									size="2"
									weight="regular">
									{permission}
								</Text>
								<Cross1Icon
									onClick={() => !disabled && handleRemoveNewPermission(permission)}
									style={{ cursor: disabled ? "default" : "pointer" }}
								/>
							</Badge>
						))}
					</Flex>
				)}
			</Flex>
		);
	};

	return (
		<>
			<Flex
				className="permissions"
				width="100%">
				<Form.Paper p="0">{renderAvailablePermissions()}</Form.Paper>
				<Form.Paper p="0">{renderCreateNewPermissions()}</Form.Paper>
			</Flex>
			<ReviewSelection
				selectedExisting={selectedAvailable}
				newPermissions={newPermissions}
			/>
		</>
	);
};
