/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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
	offset,
	limit,
	users,
	offsetChange,
	goToNext,
	nextPaginationToken,
	isSearch,
}: {
	count: number;
	offset: number;
	limit: number;
	users: User[];
	offsetChange: (offset: number) => void;
	goToNext: (paginationToken: string) => void;
	nextPaginationToken: string | undefined;
	isSearch: boolean;
}) => {
	const displayedLength = users.slice(offset, offset + limit).length;
	const handleNextPagination = () => {
		return () => {
			// go to some offset if the next page's records already exist in memory
			if (offset + limit < users.length) {
				offsetChange && offsetChange(offset + limit);
			} else {
				// load next page from API if it has nextPaginationToken
				goToNext && nextPaginationToken && goToNext(nextPaginationToken);
			}
		};
	};

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
					{users.length + " result" + (users.length > 1 ? "s" : "")}
				</Text>
			) : (
				<>
					<Text
						size="2"
						weight="medium">
						{formatNumber(offset + 1)} - {formatNumber(Math.min(offset + displayedLength, count))} of{" "}
						{formatNumber(count)}
					</Text>
					<Flex gap="3">
						<IconButton
							size="2"
							variant="soft"
							color="gray"
							onClick={() => offsetChange && offsetChange(Math.max(offset - limit, 0))}>
							<ChevronLeftIcon />
						</IconButton>
						<IconButton
							size="2"
							variant="soft"
							color="gray"
							onClick={handleNextPagination()}>
							<ChevronRightIcon />
						</IconButton>
					</Flex>
				</>
			)}
		</Flex>
	);
};
