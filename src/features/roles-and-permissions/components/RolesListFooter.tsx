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

import { Flex, IconButton, Text } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import styles from "./RolesListFooter.module.scss";

interface RolesListFooterProps {
	currentPage: number;
	totalPages: number;
	totalCount: number;
	pageSize: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onNextPage: () => void;
	onPreviousPage: () => void;
}

export default function RolesListFooter({
	currentPage,
	totalPages,
	totalCount,
	pageSize,
	hasNextPage,
	hasPreviousPage,
	onNextPage,
	onPreviousPage,
}: RolesListFooterProps) {
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, totalCount);

	return (
		<Flex
			align="center"
			justify="end"
			gap="3"
			className={styles.footer}
			mt="4">
			<Text
				size="2"
				weight="medium">
				{totalCount > 0 ? `${startIndex} - ${endIndex} of ${totalCount}` : "0 of 0"}
			</Text>
			<Flex gap="3">
				<IconButton
					size="2"
					variant="soft"
					color="gray"
					disabled={!hasPreviousPage}
					onClick={onPreviousPage}>
					<ChevronLeftIcon />
				</IconButton>
				<IconButton
					size="2"
					variant="soft"
					color="gray"
					disabled={!hasNextPage}
					onClick={onNextPage}>
					<ChevronRightIcon />
				</IconButton>
			</Flex>
		</Flex>
	);
}
