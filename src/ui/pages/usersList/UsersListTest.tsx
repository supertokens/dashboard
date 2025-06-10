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
import { Flex, Select, Text, TextField } from "@radix-ui/themes";
import Paper from "../../components/radix/paper";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import IconButton from "../../components/radix/iconButton";

import "./UsersListTest.scss";
import Button from "../../components/radix/button";

const connectionURL = "https://try.supertokens.com/appid-demo-dashboard";

const RenderDemoCallout = ({ connectionURI }: { connectionURI: string }) => {
	if (!isUsingDemoConnectionUri(connectionURI)) return null;
	return (
		<Callout
			size="1"
			mb="5"
			className="demo-callout">
			<Text
				size="2"
				weight="medium"
				className="demo-callout__text">
				connectionURI set to:{" "}
				<span className="demo-callout__text--highlighted">
					{" "}
					https://try.supertokens.com/appid-demo-dashboard{" "}
				</span>
				You are connected to an instance of SuperTokens core hosted for demo purposes, this instance should not
				be used for production apps.
			</Text>
		</Callout>
	);
};

export default function UsersListPage() {
	const [tenant, setTenant] = useState("public");

	return (
		<PageContainer>
			<PageHeading
				heading="User Management"
				subtitle="One place to manage all your users, revoke access and edit information according to your needs."
			/>
			<div className="users-list">
				<RenderDemoCallout connectionURI={connectionURL} />
				<Paper>
					<Flex>
						<Flex>
							<TextField.Root
								placeholder="Search by email, user ID, or name"
								size="2"
								variant="surface">
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
								<Select.Trigger variant="surface">
									<Flex
										as="span"
										align="center"
										gap="2">
										<Text>Tenant</Text>
										<Text>{tenant}</Text>
									</Flex>
								</Select.Trigger>
								<Select.Content position="popper">
									<Select.Item value="light">Light</Select.Item>
									<Select.Item value="dark">Dark</Select.Item>
								</Select.Content>
							</Select.Root>
							<IconButton
								size="2"
								variant="soft">
								<img
									src={getImageUrl("filter-icon.svg")}
									alt="filter-icon"
								/>
							</IconButton>
						</Flex>
						<Button
							size="2"
							variant="solid">
							<PlusIcon />
							Add User
						</Button>
					</Flex>
				</Paper>
			</div>
		</PageContainer>
	);
}
