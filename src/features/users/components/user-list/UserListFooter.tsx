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

import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Flex, IconButton, Text } from "@radix-ui/themes";
import { User } from "@features/users/types";
import { formatNumber } from "@shared/utils";

export const UserListFooter = ({
	count,
	users,
	currentPage,
	pageSize,
	goToPrevious,
	goToNext,
	hasPreviousPage,
	hasNextPage,
	isFetchingNextPage,
	isSearch,
}: {
	count: number;
	users: User[];
	currentPage: number;
	pageSize: number;
	goToPrevious: () => void;
	goToNext: () => void;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	isSearch: boolean;
}) => {
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, isSearch ? users.length : count);

	return (
		<Flex
			align="center"
			justify="end"
			gap="3"
			mt="4">
			{/* We don't support pagination for search results for now */}
			{isSearch ? (
				<Text
					size="2"
					weight="medium">
					{users.length === 0 ? "No results found" : `${users.length} result${users.length === 1 ? "" : "s"}`}
				</Text>
			) : (
				<>
					<Text
						size="2"
						weight="medium">
						{count === 0
							? null
							: `${formatNumber(startIndex)} - ${formatNumber(endIndex)} of ${formatNumber(count)}`}
					</Text>
					{count > 0 && (
						<Flex gap="3">
							<IconButton
								size="2"
								variant="soft"
								color="gray"
								disabled={!hasPreviousPage || isFetchingNextPage}
								onClick={goToPrevious}>
								<ChevronLeftIcon />
							</IconButton>
							<IconButton
								size="2"
								variant="soft"
								color="gray"
								disabled={!hasNextPage || isFetchingNextPage}
								onClick={goToNext}>
								<ChevronRightIcon />
							</IconButton>
						</Flex>
					)}
				</>
			)}
		</Flex>
	);
};
