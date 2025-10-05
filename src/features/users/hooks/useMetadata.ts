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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import useMetadataService from "@api/user/metadata";

const QUERY_KEY = "user-metadata";
const STALE_TIME = 60 * 1000; // 1 minute

export const queryKeys = {
	metadata: (userId: string) => [QUERY_KEY, userId] as const,
};

export const useMetadata = (userId: string) => {
	const queryClient = useQueryClient();
	const { getUserMetaData, updateUserMetaData } = useMetadataService();

	const metadataQuery = useQuery({
		queryKey: queryKeys.metadata(userId),
		queryFn: async () => {
			const data = await getUserMetaData(userId);

			if (data === "FEATURE_NOT_ENABLED_ERROR") {
				return "Feature Not Enabled";
			}

			if (data === undefined) {
				return undefined;
			}

			if (typeof data === "string") {
				return data;
			}

			return JSON.stringify(data);
		},
		staleTime: STALE_TIME,
		enabled: !!userId,
		retry: false,
	});

	const updateMetadataMutation = useMutation({
		mutationFn: (data: { userId: string; metadata: string }) => updateUserMetaData(data.userId, data.metadata),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.metadata(userId) });
		},
	});

	return {
		metadata: metadataQuery.data,
		isLoading: metadataQuery.isLoading,
		error: metadataQuery.error,
		refetch: metadataQuery.refetch,
		updateMetadata: updateMetadataMutation.mutateAsync,
		isUpdatingMetadata: updateMetadataMutation.isPending,
	};
};
