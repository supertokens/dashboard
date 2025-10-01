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

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import { Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import ItemLabel from "@shared/components/itemLabel";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

import "./index.scss";
import { useState } from "react";
import { assertNever } from "@utils/assertNever";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import EmptyList from "@shared/components/empty";
import CheckboxGroup from "../../checkboxGroup";

export default function AssignRoleModal({ open, handleClose }: { open: boolean; handleClose: () => void }) {
	const [rolesListState, setRolesListState] = useState<"LOADING" | "SUCCESS" | "EMPTY" | "ERROR">("EMPTY");
	return (
		<Modal
			title="Assign User Roles"
			open={open}
			handleClose={handleClose}>
			<Form className="assign-role-modal">
				<Form.Paper
					p="0"
					className="assign-role-modal__paper">
					<Flex
						direction="column"
						className="assign-role-modal__header"
						p="3">
						<ItemLabel>Select roles you want to add</ItemLabel>
					</Flex>
					<Flex
						p="3"
						className="assign-role-modal__search">
						<TextField.Root
							placeholder="Search for a role"
							className="assign-role-modal__search-field">
							<TextField.Slot>
								<MagnifyingGlassIcon />
							</TextField.Slot>
						</TextField.Root>
					</Flex>
					<Flex
						px="3"
						py="1"
						className="assign-role-modal__list-header">
						<ItemLabel>Roles</ItemLabel>
					</Flex>

					<Box p="3">
						{(() => {
							switch (rolesListState) {
								case "LOADING":
									return <Loader type="list" />;
								case "EMPTY":
									return (
										<EmptyList
											iconUrl={"key-shield.svg"}
											title="You have not created any User Roles"
											description={
												<Text className="assign-role-modal__empty-list__description">
													<a href="/roles">Click here</a> to create roles that you can assign
													to users.
												</Text>
											}
										/>
									);
								case "SUCCESS":
									return (
										<Flex className="assign-role-modal__list">
											<CheckboxGroup.Root
												defaultValue={["1"]}
												name="example"
												className="assign-role-modal__list-items">
												{[1, 2, 3].map((item) => (
													<CheckboxGroup.Item
														key={item}
														className="assign-role-modal__list-items__item"
														value={item.toString()}>
														{item}
													</CheckboxGroup.Item>
												))}
											</CheckboxGroup.Root>
										</Flex>
									);
								case "ERROR":
									return <DashboardError withBackground={false} />;
								default:
									assertNever(rolesListState);
							}
						})()}
					</Box>
				</Form.Paper>
				<Flex
					justify="end"
					mt="4">
					<Button size="3">Done</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
