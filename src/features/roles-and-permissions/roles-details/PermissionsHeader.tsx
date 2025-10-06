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

import { Flex } from "@radix-ui/themes";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";
import IconButton from "@shared/components/iconButton";
import ItemLabel from "@shared/components/itemLabel";

import styles from "./PermissionsHeader.module.scss";

interface PermissionsHeaderProps {
	selectedPermissions: string[];
	onAddPermission: () => void;
	onDeletePermissions: () => void;
}

export default function PermissionsHeader({
	selectedPermissions,
	onAddPermission,
	onDeletePermissions,
}: PermissionsHeaderProps) {
	return (
		<Flex
			className={styles["permissions-header"]}
			justify="between"
			align="center"
			width="100%">
			<ItemLabel>Permissions</ItemLabel>
			<Flex gap="2">
				<IconButton
					color="red"
					disabled={selectedPermissions.length === 0}
					variant="soft"
					size="2"
					onClick={onDeletePermissions}>
					<TrashIcon />
				</IconButton>
				<Button
					size="2"
					onClick={onAddPermission}>
					<PlusIcon /> Add Permissions
				</Button>
			</Flex>
		</Flex>
	);
}
