/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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

import { Badge, Flex, Text } from "@radix-ui/themes";
import { ChevronRightIcon } from "@radix-ui/react-icons";

import { useNavigationHelpers } from "@shared/navigation";

import styles from "./RolesListItem.module.scss";
import { withOverride } from "@plugins";

interface RolesListItemProps {
	role: string;
	permissions: string[] | undefined;
}

const RolesListItem = withOverride("RolesListItem", function RolesListItem({ role, permissions }: RolesListItemProps) {
	const { goToRoleDetails } = useNavigationHelpers();

	const handleClick = () => {
		goToRoleDetails(role);
	};

	return (
		<Flex
			align="center"
			width="100%"
			onClick={handleClick}
			className={styles.item}>
			<Text
				className={styles.item__role}
				size="3"
				weight="medium">
				{role}
			</Text>
			<Flex
				gap="3"
				className={styles.item__permissions}>
				{permissions === undefined ? (
					<Text
						size="2"
						color="gray">
						Loading...
					</Text>
				) : permissions.length === 0 ? (
					<Text
						size="2"
						color="gray">
						No permissions
					</Text>
				) : (
					permissions.map((permission, index) => (
						<Badge
							key={index + permission}
							variant="soft"
							className={styles.item__permissions__badge}
							size="2"
							radius="full">
							{permission}
						</Badge>
					))
				)}
			</Flex>

			<ChevronRightIcon
				height={20}
				width={20}
			/>
		</Flex>
	);
});

export default RolesListItem;
