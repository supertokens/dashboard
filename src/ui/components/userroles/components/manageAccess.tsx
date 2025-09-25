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
import { Flex, IconButton, Text } from "@radix-ui/themes";
import Loader from "@components/radix/loader";
import { assertNever } from "@utils/assertNever";
import DashboardError from "@components/radix/error";
import ItemLabel from "@components/radix/itemLabel";

import "./manageAccess.scss";
import EmptyList from "@components/radix/empty";
import Paper from "@components/radix/paper";
import { User } from "@pages/usersList/types";
import Button from "@components/radix/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import RemoveAccessModal from "@components/radix/modals/removeAccess";

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

const ManageAccessFooter = () => {
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
				1 - 10 of 54
			</Text>
			<Flex gap="3">
				<IconButton
					size="2"
					variant="soft"
					color="gray">
					<ChevronLeftIcon />
				</IconButton>
				<IconButton
					size="2"
					variant="soft"
					color="gray">
					<ChevronRightIcon />
				</IconButton>
			</Flex>
		</Flex>
	);
};

const ManageAccessTable = () => {
	const [openRemoveAccessModal, setOpenRemoveAccessModal] = useState(false);
	const users: User[] = [
		{
			id: "1",
			timeJoined: 1706803500000, // 2024-02-01T15:45:00Z
			emails: ["john.doe@example.com"],
			phoneNumbers: [],
			thirdParty: [],
			loginMethods: [],
			firstName: "John",
			lastName: "Doe",
			tenantIds: ["default"],
			isPrimaryUser: true,
		},
		{
			id: "2",
			timeJoined: 1706805600000, // 2024-02-01T16:20:00Z
			emails: ["jane.smith@example.com"],
			phoneNumbers: [],
			thirdParty: [],
			loginMethods: [],
			firstName: "Jane",
			lastName: "Smith",
			tenantIds: ["default"],
			isPrimaryUser: true,
		},
		{
			id: "3",
			timeJoined: 1706801400000, // 2024-02-01T14:30:00Z
			emails: ["mike.wilson@example.com"],
			phoneNumbers: [],
			thirdParty: [],
			loginMethods: [],
			firstName: "Mike",
			lastName: "Wilson",
			tenantIds: ["default"],
			isPrimaryUser: true,
		},
	];

	if (users.length === 0) {
		return (
			<Flex
				px="3"
				py="4"
				justify="center"
				align="center"
				width="100%">
				<EmptyList
					iconUrl={"user.svg"}
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
							<Text
								size="2"
								weight="medium"
								color="gray">
								{user.emails[0]}
							</Text>
							<Text
								size="2"
								weight="medium"
								color="gray">
								{user.phoneNumbers[0]}
							</Text>
						</Flex>
						<Button
							size="2"
							variant="outline"
							color="gray"
							onClick={() => setOpenRemoveAccessModal(true)}>
							Remove
						</Button>
					</Flex>
				))}
			</Flex>
			<RemoveAccessModal
				open={openRemoveAccessModal}
				handleClose={() => setOpenRemoveAccessModal(false)}
			/>
		</Paper>
	);
};

export default function ManageAccess() {
	const [state, setState] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");

	switch (state) {
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
					<ManageAccessTable />
					<ManageAccessFooter />
				</Flex>
			);
		case "ERROR":
			return <DashboardError withBackground={false} />;
		default:
			return assertNever(state);
	}
}
