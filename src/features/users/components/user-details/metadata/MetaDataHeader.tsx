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

import { Box, Flex } from "@radix-ui/themes";
import { Pencil1Icon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";
import ItemLabel from "@shared/components/itemLabel";
import Separator from "@shared/components/separator";

import styles from "./MetaDataHeader.module.scss";

interface MetaDataHeaderProps {
	readonly isEditing: boolean;
	readonly onEdit: () => void;
	readonly onCancel: () => void;
	readonly onSave: () => void;
	readonly isLoading: boolean;
}

export default function MetaDataHeader({ isEditing, onEdit, onCancel, onSave, isLoading }: MetaDataHeaderProps) {
	return (
		<Box width="100%">
			<Flex
				className={styles["metadata-header"]}
				justify="between"
				align="center"
				px="4"
				py="3">
				<Flex
					align="center"
					justify="between"
					width="100%">
					<ItemLabel mr="2">User metadata details </ItemLabel>
					{!isEditing ? (
						<Button
							size="2"
							onClick={onEdit}>
							<Pencil1Icon /> Edit
						</Button>
					) : (
						<Flex
							align="center"
							gap="2">
							<Button
								variant="outline"
								color="gray"
								size="2"
								onClick={onCancel}
								disabled={isLoading}>
								Cancel
							</Button>
							<Button
								size="2"
								onClick={onSave}
								loading={isLoading}>
								Save
							</Button>
						</Flex>
					)}
				</Flex>
			</Flex>
			<Separator fullWidth />
		</Box>
	);
}
