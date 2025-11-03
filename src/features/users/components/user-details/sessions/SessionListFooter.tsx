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

import { Flex, IconButton, Text } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import { formatNumber } from "@shared/utils";

const PAGE_SIZE = 10;

interface SessionListFooterProps {
	readonly totalSessions: number;
	readonly currentPage: number;
	readonly onPageChange: (page: number) => void;
}

export default function SessionListFooter({ totalSessions, currentPage, onPageChange }: SessionListFooterProps) {
	const totalPages = Math.ceil(totalSessions / PAGE_SIZE);
	const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
	const endIndex = Math.min(currentPage * PAGE_SIZE, totalSessions);

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	};

	if (totalSessions === 0) {
		return null;
	}

	return (
		<Flex
			align="center"
			justify="end"
			gap="3"
			my="4"
			px="4">
			<Text
				size="2"
				weight="medium">
				{startIndex} - {endIndex} of {formatNumber(totalSessions)}
			</Text>
			<Flex gap="3">
				<IconButton
					size="2"
					variant="soft"
					color="gray"
					onClick={handlePreviousPage}
					disabled={currentPage === 1}>
					<ChevronLeftIcon />
				</IconButton>
				<IconButton
					size="2"
					variant="soft"
					color="gray"
					onClick={handleNextPage}
					disabled={currentPage === totalPages}>
					<ChevronRightIcon />
				</IconButton>
			</Flex>
		</Flex>
	);
}
