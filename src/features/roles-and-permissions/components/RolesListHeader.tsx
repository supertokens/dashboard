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

import { Flex, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";

import styles from "./RolesListHeader.module.scss";

interface RolesListHeaderProps {
	isLoading: boolean;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onAddRoleClick: () => void;
}

export default function RolesListHeader({
	isLoading,
	searchQuery,
	onSearchChange,
	onAddRoleClick,
}: RolesListHeaderProps) {
	return (
		<Flex
			justify="between"
			align="center"
			gap="8"
			mb="4"
			className={styles.header}>
			<Flex
				flexGrow="1"
				gap="2"
				align="center"
				maxWidth="600px">
				<TextField.Root
					placeholder="Search by role name"
					size="2"
					variant="surface"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					disabled={isLoading}
					className={styles.header__search}>
					<TextField.Slot>
						<MagnifyingGlassIcon
							height="16"
							width="16"
						/>
					</TextField.Slot>
				</TextField.Root>
			</Flex>
			<Button
				size="2"
				variant="solid"
				disabled={isLoading}
				onClick={onAddRoleClick}>
				<PlusIcon />
				Add Role
			</Button>
		</Flex>
	);
}
