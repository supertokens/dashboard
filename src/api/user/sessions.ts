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

import { SessionInfo } from "@features/users/types";
import { getApiUrl, useFetchData } from "@shared/utils";

interface IUseSessionsForUserService {
	getSessionsForUser: (userId: string) => Promise<SessionInfo[] | undefined>;
	deleteSessionsForUser: (sessionHandles: string[]) => Promise<void>;
}

const useSessionsForUserService = (): IUseSessionsForUserService => {
	const fetchData = useFetchData();

	const getSessionsForUser = async (userId: string): Promise<SessionInfo[] | undefined> => {
		const { Implementation } = await import("../../implementation");
		return await Implementation.getInstanceOrThrow().getSessionsForUser({ userId, fetchData, getApiUrl });
	};

	const deleteSessionsForUser = async (sessionHandles: string[]): Promise<void> => {
		const { Implementation } = await import("../../implementation");
		return await Implementation.getInstanceOrThrow().deleteSessionsForUser({
			sessionHandles,
			fetchData,
			getApiUrl,
		});
	};

	return {
		getSessionsForUser,
		deleteSessionsForUser,
	};
};

export default useSessionsForUserService;
