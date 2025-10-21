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

import { useState, useMemo, useEffect } from "react";
import { Flex } from "@radix-ui/themes";

import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";

import { useSessions } from "@features/users/hooks/useSessions";

import SessionHeader from "./SessionHeader";
import SessionList from "./SessionList";
import SessionListFooter from "./SessionListFooter";

const PAGE_SIZE = 10;

interface SessionsProps {
	readonly userId: string;
}

export default function Sessions({ userId }: SessionsProps) {
	const { sessions, isLoading, error } = useSessions(userId);
	const [currentPage, setCurrentPage] = useState(1);

	const paginatedSessions = useMemo(() => {
		const startIndex = (currentPage - 1) * PAGE_SIZE;
		const endIndex = startIndex + PAGE_SIZE;
		return sessions.slice(startIndex, endIndex);
	}, [sessions, currentPage]);

	// Reset to page 1 when sessions change (e.g., after deletion)
	// This prevents being on an empty page after deleting the last item on a page
	useEffect(() => {
		const totalPages = Math.ceil(sessions.length / PAGE_SIZE);
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		} else if (sessions.length === 0) {
			setCurrentPage(1);
		}
	}, [sessions.length, currentPage]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	if (isLoading) {
		return (
			<Flex
				width="100%"
				p="3">
				<Loader type="list" />
			</Flex>
		);
	}

	if (error) {
		return <DashboardError withBackground={false} />;
	}

	return (
		<Flex
			width="100%"
			direction="column">
			<SessionHeader userId={userId} />
			<SessionList
				userId={userId}
				paginatedSessions={paginatedSessions}
			/>
			<SessionListFooter
				totalSessions={sessions.length}
				currentPage={currentPage}
				onPageChange={handlePageChange}
			/>
		</Flex>
	);
}
