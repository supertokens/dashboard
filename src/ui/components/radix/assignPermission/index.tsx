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

import Loader from "@components/radix/loader";
import { Cross1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Badge, Flex, Text, TextField } from "@radix-ui/themes";
import DashboardError from "@components/radix/error";
import { useState } from "react";
import EmptyList from "@components/radix/empty";
import Form from "@components/radix/form";
import CheckboxGroup from "../checkboxGroup";

import "./index.scss";

const ReviewSelection = () => {
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
					1 selected
				</Badge>
			</Flex>
			<Flex className="permissions__review-selection__content">
				<Flex
					className="permissions__review-selection__content__existing"
					direction="column"
					gap="3">
					<Text className="permissions__review-selection__content__existing__title">
						<Text
							size="2"
							weight="medium">
							Existing (2)
						</Text>
					</Text>

					<Flex gap="3">
						{["test1", "test2"].map((item) => (
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
				<Flex
					className="permissions__review-selection__content__new"
					direction="column"
					gap="3">
					<Text className="permissions__review-selection__content__new__title">
						<Text
							size="2"
							weight="medium">
							New (2)
						</Text>
					</Text>
					<Flex gap="3">
						{["test3", "test4"].map((item) => (
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
			</Flex>
		</Form.Paper>
	);
};

export const AssignPermission = () => {
	const [existingPermissionsStatus, setExistingPermissionsStatus] = useState<"LOADING" | "SUCCESS" | "ERROR">(
		"SUCCESS"
	);
	const [existingPermissions, setExistingPermissions] = useState<string[]>(["test1", "test2", "test3"]);

	const renderExistingPermissions = () => {
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
					switch (existingPermissionsStatus) {
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
										className="permissions__existing-permissions__search">
										<TextField.Slot>
											<MagnifyingGlassIcon />
										</TextField.Slot>
									</TextField.Root>

									<CheckboxGroup.Root
										defaultValue={["1"]}
										name="example"
										className="permissions__existing-permissions__list-items">
										{["test1", "test2", "test3"].map((item) => (
											<CheckboxGroup.Item
												key={item}
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
		const permissions = ["test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9", "test10"];
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
					<TextField.Root placeholder="Enter Permission Name"></TextField.Root>
					<Text
						size="1"
						weight="medium"
						className="permissions__create-new-permissions__search__guide">
						Press "Enter" to add the permission
					</Text>
				</Flex>

				{permissions.length === 0 ? (
					<EmptyList
						iconUrl="permissions.svg"
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
						{permissions.map((permission) => (
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
								<Cross1Icon />
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
				<Form.Paper p="0">{renderExistingPermissions()}</Form.Paper>
				<Form.Paper p="0">{renderCreateNewPermissions()}</Form.Paper>
			</Flex>
			<ReviewSelection />
		</>
	);
};
