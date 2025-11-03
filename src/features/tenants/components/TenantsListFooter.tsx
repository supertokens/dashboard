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

import { Flex, Text } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import IconButton from "@shared/components/iconButton";

import { TENANTS_PAGINATION_LIMIT } from "../constants";

import styles from "./TenantsListFooter.module.scss";

interface TenantsListFooterProps {
	totalCount: number;
	currentPage: number;
	setCurrentPage: (page: number) => void;
	isSearch: boolean;
}

export default function TenantsListFooter({
	totalCount,
	currentPage,
	setCurrentPage,
	isSearch,
}: TenantsListFooterProps) {
	const totalPages = Math.ceil(totalCount / TENANTS_PAGINATION_LIMIT);
	const startIndex = (currentPage - 1) * TENANTS_PAGINATION_LIMIT + 1;
	const endIndex = Math.min(currentPage * TENANTS_PAGINATION_LIMIT, totalCount);

	const canGoPrevious = currentPage > 1;
	const canGoNext = currentPage < totalPages;

	return (
		<Flex
			align="center"
			justify="end"
			gap="3"
			className={styles["tenants-list-footer"]}
			mt="4">
			{isSearch ? (
				<Text
					size="2"
					weight="medium">
					{totalCount} results
				</Text>
			) : (
				<>
					<Text
						size="2"
						weight="medium">
						{startIndex} - {endIndex} of {totalCount}
					</Text>

					<Flex gap="3">
						<IconButton
							size="2"
							variant="soft"
							color="gray"
							disabled={!canGoPrevious}
							onClick={() => setCurrentPage(currentPage - 1)}>
							<ChevronLeftIcon />
						</IconButton>
						<IconButton
							size="2"
							variant="soft"
							color="gray"
							disabled={!canGoNext}
							onClick={() => setCurrentPage(currentPage + 1)}>
							<ChevronRightIcon />
						</IconButton>
					</Flex>
				</>
			)}
		</Flex>
	);
}
