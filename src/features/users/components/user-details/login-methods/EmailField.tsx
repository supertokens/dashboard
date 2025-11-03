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

import { CheckCircledIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Flex, IconButton, Tooltip } from "@radix-ui/themes";

import ItemLabel from "@shared/components/itemLabel";
import ItemValue from "@shared/components/itemValue";

interface EmailFieldProps {
	readonly email: string;
	readonly isVerified?: boolean;
	readonly showEditIcon?: boolean;
	readonly onEditClick?: () => void;
	readonly className?: string;
}

export default function EmailField({ email, isVerified, showEditIcon, onEditClick, className }: EmailFieldProps) {
	return (
		<Flex
			align="center"
			gap="2"
			mb="4">
			<ItemLabel className={className}>Email:</ItemLabel>
			<ItemValue>{email}</ItemValue>
			{showEditIcon && onEditClick && (
				<Pencil1Icon
					onClick={onEditClick}
					style={{ cursor: "pointer" }}
				/>
			)}
			{isVerified && (
				<Tooltip content="Verified email">
					<IconButton
						size="1"
						variant="soft"
						color="green"
						ml="2">
						<CheckCircledIcon />
					</IconButton>
				</Tooltip>
			)}
		</Flex>
	);
}
