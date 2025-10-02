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

import { useCallback, useMemo, useEffect, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetchUsersService } from "@api/users";
import useFetchCount from "@api/users/count";
import useFetchSearchTags from "@api/search/searchTags";
import { UserPaginationList } from "@features/users/types";

export interface UserSearchCriteria {
	readonly email?: string;
	readonly phone?: string;
	readonly recipe?: string;
	readonly provider?: string;
}

// Query configuration constants
const QUERY_CONFIG = {
	staleTime: {
		users: 60 * 1000, // 1 minute
		count: 5 * 60 * 1000, // 5 minutes
		tags: 10 * 60 * 1000, // 10 minutes
	},
} as const;

// Query key constants
const QUERY_KEYS = {
	USERS_SEARCH: "users-search",
	USERS_INFINITE: "users-infinite",
	USERS_COUNT: "users-count",
	SEARCH_TAGS: "search-tags",
} as const;

// Query key factories
const queryKeys = {
	users: {
		search: (tenantId?: string, criteria?: UserSearchCriteria | null) =>
			[QUERY_KEYS.USERS_SEARCH, tenantId, criteria] as const,
		infinite: (tenantId?: string) => [QUERY_KEYS.USERS_INFINITE, tenantId] as const,
		count: (tenantId?: string) => [QUERY_KEYS.USERS_COUNT, tenantId] as const,
	},
	tags: () => [QUERY_KEYS.SEARCH_TAGS] as const,
} as const;

interface UseUsersListOptions {
	readonly tenantId?: string;
	readonly searchCriteria?: UserSearchCriteria | null;
}

const PAGE_SIZE = 10; // Users per page

export const useUsersList = (options: UseUsersListOptions = {}) => {
	const { tenantId, searchCriteria } = options;
	const queryClient = useQueryClient();
	const [currentPage, setCurrentPage] = useState(1);

	const { fetchUsers } = useFetchUsersService();
	const { fetchCount } = useFetchCount();
	const { fetchSearchTags } = useFetchSearchTags();

	const isSearchActive = useMemo(() => {
		return searchCriteria && Object.values(searchCriteria).some((value) => value != null && value !== "");
	}, [searchCriteria]);

	// Invalidate queries when tenant changes to ensure fresh data
	useEffect(() => {
		if (tenantId) {
			void queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === QUERY_KEYS.USERS_SEARCH });
			void queryClient.invalidateQueries({
				predicate: (query) => query.queryKey[0] === QUERY_KEYS.USERS_INFINITE,
			});
			void queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === QUERY_KEYS.USERS_COUNT });
		}
	}, [tenantId, queryClient]);

	// Search query - for when user searches
	const searchQuery = useQuery({
		queryKey: queryKeys.users.search(tenantId, searchCriteria),
		queryFn: () => fetchUsers({ limit: 1000 }, searchCriteria || undefined, tenantId),
		enabled: !!isSearchActive,
		staleTime: QUERY_CONFIG.staleTime.users,
		retry: false,
	});

	// Infinite query for pagination - for normal user list browsing
	const infiniteQuery = useInfiniteQuery({
		queryKey: queryKeys.users.infinite(tenantId),
		queryFn: ({ pageParam }: { pageParam: string | null }) => {
			return fetchUsers(
				pageParam ? { paginationToken: pageParam, limit: PAGE_SIZE } : { limit: PAGE_SIZE },
				undefined,
				tenantId
			);
		},
		getNextPageParam: (lastPage: UserPaginationList | undefined) => lastPage?.nextPaginationToken || null,
		initialPageParam: null as string | null,
		enabled: !isSearchActive,
		staleTime: QUERY_CONFIG.staleTime.users,
		retry: false,
	});

	// Count query
	const countQuery = useQuery({
		queryKey: queryKeys.users.count(tenantId),
		queryFn: () => fetchCount(tenantId),
		enabled: !isSearchActive,
		staleTime: QUERY_CONFIG.staleTime.count,
		retry: false,
	});

	// Tags query
	const tagsQuery = useQuery({
		queryKey: queryKeys.tags(),
		queryFn: () => fetchSearchTags(),
		staleTime: QUERY_CONFIG.staleTime.tags,
		select: (data) => data?.tags || [],
		retry: false,
	});

	// Flatten paginated users for infinite query
	const paginatedUsers = useMemo(() => {
		return infiniteQuery.data?.pages.flatMap((page: UserPaginationList | undefined) => page?.users || []) || [];
	}, [infiniteQuery.data]);

	// Get final users list
	const users = useMemo(() => {
		return isSearchActive ? searchQuery.data?.users || [] : paginatedUsers;
	}, [isSearchActive, searchQuery.data?.users, paginatedUsers]);

	const totalCount = isSearchActive ? users.length : countQuery.data?.count ?? 0;
	const isLoading = isSearchActive
		? searchQuery.isLoading
		: infiniteQuery.isLoading || countQuery.isLoading || tagsQuery.isLoading;
	const error = searchQuery.error || infiniteQuery.error || countQuery.error || tagsQuery.error;

	const refetch = useCallback(async () => {
		// Always refetch tags
		await tagsQuery.refetch();

		// Only refetch active queries based on current state
		if (isSearchActive) {
			await searchQuery.refetch();
		} else {
			await Promise.allSettled([infiniteQuery.refetch(), countQuery.refetch()]);
		}
	}, [searchQuery, infiniteQuery, countQuery, tagsQuery, isSearchActive]);

	const invalidateQueries = useCallback(async () => {
		// Invalidate all user-related queries to trigger fresh fetches with new tenant
		await Promise.allSettled([
			queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === QUERY_KEYS.USERS_SEARCH }),
			queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === QUERY_KEYS.USERS_INFINITE }),
			queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === QUERY_KEYS.USERS_COUNT }),
		]);
	}, [queryClient]);

	// Pagination functions
	const goToNextPage = useCallback(() => {
		const nextPage = currentPage + 1;
		const nextPageStartIndex = (nextPage - 1) * PAGE_SIZE;

		// Check if we need to fetch more data
		if (nextPageStartIndex >= users.length && infiniteQuery.hasNextPage) {
			void infiniteQuery.fetchNextPage();
		}

		setCurrentPage(nextPage);
	}, [currentPage, users.length, infiniteQuery]);

	const goToPreviousPage = useCallback(() => {
		if (currentPage > 1) {
			setCurrentPage((prev) => prev - 1);
		}
	}, [currentPage]);

	// Calculate current page users for display
	const currentPageUsers = useMemo(() => {
		if (isSearchActive) return users;

		const startIndex = (currentPage - 1) * PAGE_SIZE;
		const endIndex = startIndex + PAGE_SIZE;
		return users.slice(startIndex, endIndex);
	}, [users, currentPage, isSearchActive]);

	const hasPreviousPage = currentPage > 1;
	const totalPages = Math.ceil(totalCount / PAGE_SIZE);

	// Calculate if there's a next page
	const hasNextPageCalc = useMemo(() => {
		if (isSearchActive) return false;

		const nextPageStartIndex = currentPage * PAGE_SIZE;

		// If we have data for the next page already loaded, there's a next page
		if (nextPageStartIndex < users.length) return true;

		// If we don't have data but React Query can fetch more, there's a next page
		if (infiniteQuery.hasNextPage) return true;

		// No next page available
		return false;
	}, [isSearchActive, currentPage, users.length, infiniteQuery.hasNextPage]);

	return {
		users: currentPageUsers,
		totalCount,
		availableTags: tagsQuery.data || [],
		isLoading,
		isSearchActive: !!isSearchActive,
		error,
		currentPage,
		pageSize: PAGE_SIZE,
		totalPages,
		hasNextPage: hasNextPageCalc,
		hasPreviousPage,
		isFetchingNextPage: infiniteQuery.isFetchingNextPage,
		goToNextPage,
		goToPreviousPage,
		refetch,
		invalidateQueries,
	};
};
