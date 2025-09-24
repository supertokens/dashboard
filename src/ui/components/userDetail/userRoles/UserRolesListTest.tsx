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

import { useState } from "react";
import "./userRolesListTest.scss";
import { Box, Flex } from "@radix-ui/themes";
import Loader from "@components/radix/loader";
import { assertNever } from "@utils/assertNever";
import DashboardError from "@components/radix/error";
import ItemLabel from "@components/radix/itemLabel";
import Separator from "@components/radix/separator";
import Button from "@components/radix/button";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import Select from "@components/radix/select";
import { NOOP } from "@utils/noop";
import AssignRoleModal from "@components/radix/modals/assignRole";
import Callout from "@components/radix/callout";
import Paper from "@components/radix/paper";
import Crystal from "@components/radix/crystal";
import IconButton from "@components/radix/iconButton";
import DeleteRoleModal from "@components/radix/modals/deleteRole";

const RolesHeader = () => {
	const [openRevokeAllSessionModal, setOpenRevokeAllSessionModal] = useState(false);
	return (
		<Box width="100%">
			<Flex
				className="roles__header"
				justify="between"
				align="center"
				px="4"
				py="3">
				<Flex align="center">
					<ItemLabel mr="2">All roles assigned to the user for tenant: </ItemLabel>
					<Select
						items={[]}
						onValueChange={NOOP}
						selectedValue={""}
						triggerClassName="roles__header__select"
					/>
				</Flex>
				<Button
					size="2"
					onClick={() => setOpenRevokeAllSessionModal(true)}>
					<PlusIcon />
					Assign Role{" "}
				</Button>
			</Flex>
			<AssignRoleModal
				open={openRevokeAllSessionModal}
				handleClose={() => setOpenRevokeAllSessionModal(false)}
			/>

			<Separator fullWidth />
		</Box>
	);
};

const RolesList = () => {
	const roles: string[] = ["test", "test2", "test3"];
	const [openDeleteRoleModal, setOpenDeleteRoleModal] = useState(false);

	if (roles.length === 0) {
		return (
			<Flex p="4">
				<Callout
					className="roles-list__callout"
					type="info">
					This user currently has no roles assigned.
				</Callout>
			</Flex>
		);
	}

	return (
		<Flex p="4">
			<Paper
				p="0"
				width="100%"
				className="roles-list">
				<Flex
					className="roles-list__header"
					align="center"
					p="3">
					<ItemLabel className="roles-list__header__role">Roles</ItemLabel>
					<ItemLabel className="roles-list__header__permission">Permissions</ItemLabel>
					<ItemLabel className="roles-list__header__action">{""}</ItemLabel>
				</Flex>
				<Flex
					className="roles-list__body"
					direction="column">
					{roles.map((role) => (
						<Flex
							key={role}
							align="center"
							p="3"
							className="roles-list__body__item">
							<ItemLabel className="roles-list__body__role">{role}</ItemLabel>
							<Flex
								align="center"
								gap="2"
								className="roles-list__body__permission">
								<Crystal>Read</Crystal>
								<Crystal>Write</Crystal>
							</Flex>

							<Flex
								className="roles-list__body__action"
								justify="end"
								align="center">
								<IconButton
									variant="soft"
									size="2"
									color="red"
									onClick={() => setOpenDeleteRoleModal(true)}>
									<TrashIcon />
								</IconButton>
							</Flex>
							<DeleteRoleModal
								open={openDeleteRoleModal}
								handleClose={() => setOpenDeleteRoleModal(false)}
							/>
						</Flex>
					))}
				</Flex>
			</Paper>
		</Flex>
	);
};

export default function Roles() {
	const [state] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");

	switch (state) {
		case "LOADING":
			return (
				<Flex
					width="100%"
					p="3">
					<Loader type="list" />
				</Flex>
			);
		case "SUCCESS":
			return (
				<Flex
					width="100%"
					direction="column">
					<RolesHeader />
					<RolesList />
				</Flex>
			);
		case "ERROR":
			return <DashboardError withBackground={false} />;
		default:
			assertNever(state);
	}
}
