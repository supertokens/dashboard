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
import { TrashIcon } from "@radix-ui/react-icons";

import ItemLabel from "@shared/components/itemLabel";
import Crystal from "@shared/components/crystal";
import IconButton from "@shared/components/iconButton";

import { usePermissions } from "@features/users/hooks";

import styles from "./RoleRow.module.scss";

interface RoleRowProps {
	readonly role: string;
	readonly onRemoveClick: (role: string) => void;
}

export default function RoleRow({ role, onRemoveClick }: RoleRowProps) {
	const { permissions, isLoading } = usePermissions(role);

	const permissionsArray = permissions?.status === "OK" ? permissions.permissions : null;
	const hasNoPermissions = !isLoading && (!permissionsArray || permissionsArray.length === 0);

	return (
		<Flex
			align="center"
			p="3"
			className={styles["role-row"]}>
			<ItemLabel className={styles["role-row__role"]}>{role}</ItemLabel>
			<Flex
				align="center"
				gap="2"
				className={styles["role-row__permission"]}>
				{isLoading ? (
					<Crystal>Loading...</Crystal>
				) : hasNoPermissions ? (
					<Crystal>No permissions data</Crystal>
				) : (
					permissionsArray &&
					permissionsArray.map((permission) => (
						<Crystal
							key={permission}
							className={styles["role-row__permission-badge"]}>
							{permission}
						</Crystal>
					))
				)}
			</Flex>

			<Flex
				className={styles["role-row__action"]}
				justify="end"
				align="center">
				<IconButton
					variant="soft"
					size="2"
					color="red"
					onClick={() => onRemoveClick(role)}>
					<TrashIcon />
				</IconButton>
			</Flex>
		</Flex>
	);
}
