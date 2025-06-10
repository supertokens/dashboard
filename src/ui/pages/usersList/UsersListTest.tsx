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

import PageContainer from "../../components/radix/pageContainer";
import PageHeading from "../../components/radix/pageHeading";
import Callout from "../../components/radix/callout";
import { getImageUrl, isUsingDemoConnectionUri } from "../../../utils";
import { Box, Flex, Select, Text, TextField } from "@radix-ui/themes";
import Paper from "../../components/radix/paper";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import IconButton from "../../components/radix/iconButton";

import "./UsersListTest.scss";
import Button from "../../components/radix/button";
import Loader from "../../components/radix/loader";
import DashboardError from "../../components/radix/error";
import { assertNever } from "../../../utils/assertNever";

const connectionURL = "https://try.supertokens.com/appid-demo-dashboard";

const RenderDemoCallout = ({ connectionURI }: { connectionURI: string }) => {
	if (!isUsingDemoConnectionUri(connectionURI)) return null;
	return (
		<Callout
			size="1"
			mb="5"
			className="users-list__demo-callout">
			<Text
				size="2"
				weight="medium"
				className="users-list__demo-callout__text">
				connectionURI set to:{" "}
				<span className="users-list__demo-callout__text--highlighted">
					{" "}
					https://try.supertokens.com/appid-demo-dashboard{" "}
				</span>
				You are connected to an instance of SuperTokens core hosted for demo purposes, this instance should not
				be used for production apps.
			</Text>
		</Callout>
	);
};

const UserListHeader = ({ tenant, setTenant }: { tenant: string; setTenant: (tenant: string) => void }) => {
	return (
		<Flex
			justify="between"
			align="center"
			gap="8"
			mb="4"
			className="users-list__header">
			<Flex
				flexGrow="1"
				gap="2"
				align="center"
				maxWidth="550px">
				<TextField.Root
					placeholder="Search by email, user ID, or name"
					size="2"
					variant="surface"
					className="users-list__header__search">
					<TextField.Slot>
						<MagnifyingGlassIcon
							height="16"
							width="16"
						/>
					</TextField.Slot>
				</TextField.Root>
				<Select.Root
					size="2"
					value={tenant}
					onValueChange={setTenant}>
					<Select.Trigger
						variant="surface"
						className="users-list__header__select">
						<Flex
							as="span"
							align="center"
							gap="2">
							<Text
								size="2"
								weight="regular"
								className="users-list__header__select__text--gray">
								Tenant ID:
							</Text>
							<Text
								size="2"
								weight="medium"
								className="users-list__header__select__text--solid">
								{tenant}
							</Text>
						</Flex>
					</Select.Trigger>
					<Select.Content position="popper">
						<Select.Item value="light">Light</Select.Item>
						<Select.Item value="dark">Dark</Select.Item>
					</Select.Content>
				</Select.Root>
				<IconButton
					size="2"
					variant="soft"
					color="gray">
					<img
						src={getImageUrl("filter-icon.svg")}
						alt="filter-icon"
					/>
				</IconButton>
			</Flex>
			<Button
				size="2"
				variant="solid"
				className="users-list__header__btn">
				<PlusIcon />
				Add User
			</Button>
		</Flex>
	);
};

const UserListItem = ({
	name,
	email,
	timeJoined,
	isLast,
}: {
	name: string;
	email: string;
	timeJoined: string;
	isLast: boolean;
}) => {
	return (
		<Flex
			align="center"
			width="100%"
			className={`users-list__table__item ${isLast ? "users-list__table__item--last" : ""}`}>
			<Flex
				className="users-list__table__item__details"
				direction="column"
				gap="1">
				<Text
					className="users-list__table__item__details__name"
					size="3"
					weight="medium">
					{name}
				</Text>
				<Text
					className="users-list__table__item__details__email"
					size="2"
					weight="medium">
					{email}
				</Text>
			</Flex>
			<Text
				className="users-list__table__item__time-joined"
				size="2"
				weight="medium">
				{timeJoined}
			</Text>
			<ChevronRightIcon
				height={20}
				width={20}
			/>
		</Flex>
	);
};

const USERS = [
	{
		name: "John Smith",
		email: "john.smith@example.com",
		timeJoined: "2024-01-15 09:30",
	},
	{
		name: "Sarah Johnson",
		email: "sarah.j@example.com",
		timeJoined: "2024-01-14 14:45",
	},
	{
		name: "Michael Chen",
		email: "m.chen@example.com",
		timeJoined: "2024-01-13 11:20",
	},
	{
		name: "Emily Brown",
		email: "emily.brown@example.com",
		timeJoined: "2024-01-12 16:15",
	},
	{
		name: "David Wilson",
		email: "d.wilson@example.com",
		timeJoined: "2024-01-11 10:00",
	},
];

const UserListTable = () => {
	const [sort, setSort] = useState<"asc" | "desc">("desc");
	return (
		<Box className="users-list__table">
			<Flex
				align="center"
				className="users-list__table__header">
				<Text
					size="2"
					weight="medium"
					className="users-list__table__header__user">
					Users
				</Text>
				<Text
					size="2"
					weight="medium"
					className="users-list__table__header__time-joined">
					Time Joined{" "}
					<img
						src={getImageUrl(sort === "asc" ? "sort-ascending.svg" : "sort-descending.svg")}
						alt="sort-ascending"
						onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
					/>
				</Text>
			</Flex>
			<Flex direction="column">
				{USERS.map((user, index) => (
					<UserListItem
						key={user.email}
						isLast={index === USERS.length - 1}
						{...user}
					/>
				))}
			</Flex>
		</Box>
	);
};

const UserListFooter = () => {
	return (
		<Flex
			align="center"
			justify="end"
			gap="3"
			className="users-list__table__footer"
			mt="4">
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
export default function UsersListPage() {
	const [state, setState] = useState<"LOADING" | "ERROR" | "SUCCESS">("LOADING");
	const [tenant, setTenant] = useState("public");

	return (
		<PageContainer>
			<PageHeading
				heading="User Management"
				subtitle="One place to manage all your users, revoke access and edit information according to your needs."
			/>
			<div className="users-list">
				<RenderDemoCallout connectionURI={connectionURL} />
				{(() => {
					switch (state) {
						case "LOADING":
							return <Loader type="list" />;
						case "ERROR":
							return <DashboardError />;
						case "SUCCESS":
							return (
								<Paper>
									<UserListHeader
										tenant={tenant}
										setTenant={setTenant}
									/>
									<UserListTable />
									<UserListFooter />
								</Paper>
							);
						default:
							assertNever(state);
					}
				})()}
			</div>
		</PageContainer>
	);
}
