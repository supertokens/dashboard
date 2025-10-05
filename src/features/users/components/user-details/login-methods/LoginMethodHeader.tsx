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

import { ExitIcon, TrashIcon } from "@radix-ui/react-icons";
import { Flex } from "@radix-ui/themes";

import Button from "@shared/components/button";
import IconButton from "@shared/components/iconButton";
import ItemLabel from "@shared/components/itemLabel";
import Separator from "@shared/components/separator";

import { formatLongDate } from "@shared/utils";

import { LoginMethod } from "@features/users/types";

interface LoginMethodHeaderProps {
	readonly loginMethod: LoginMethod;
	readonly onDelete: () => void;
	readonly onUnlink: () => void;
	readonly showUnlink: boolean;
}

export default function LoginMethodHeader({ loginMethod, onDelete, onUnlink, showUnlink }: LoginMethodHeaderProps) {
	const getRecipeName = () => {
		switch (loginMethod.recipeId) {
			case "emailpassword":
				return "Email Password";
			case "passwordless":
				return "Passwordless";
			case "thirdparty":
				return `Third Party  ${loginMethod.thirdParty?.id ? `- ${loginMethod.thirdParty?.id}` : ""}`;
			default:
				return "";
		}
	};

	return (
		<Flex
			align="center"
			justify="between"
			px="4"
			py="3">
			<Flex
				align="center"
				gap="3">
				<ItemLabel bold>{getRecipeName()}</ItemLabel>
				<Separator orientation="vertical" />
				<ItemLabel
					color="purple"
					bold>
					{loginMethod.tenantIds[0] === "public" ? "Public" : loginMethod.tenantIds[0]}
				</ItemLabel>
				<Separator orientation="vertical" />
				<ItemLabel>{formatLongDate(loginMethod.timeJoined)}</ItemLabel>
			</Flex>
			<Flex
				gap="2"
				align="center">
				{showUnlink && (
					<Button
						size="2"
						variant="soft"
						onClick={onUnlink}>
						<ExitIcon /> Unlink
					</Button>
				)}
				<IconButton
					size="2"
					color="red"
					variant="soft"
					onClick={onDelete}>
					<TrashIcon />
				</IconButton>
			</Flex>
		</Flex>
	);
}
