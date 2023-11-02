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

import { createContext, useContext, useState } from "react";
import { Role } from "../types";

type UserRolesContextType = {
	roles: Role[];
	setRoles: (roles: Role[]) => void;
};

const UserRolesContext = createContext<UserRolesContextType | undefined>(undefined);

export function useUserRolesContext() {
	const context = useContext(UserRolesContext);

	if (context === undefined) {
		throw Error("useUserRolesContext is used outside the UserRolesContext provider.");
	}

	return context;
}

export default function UserRolesContextProvider({ children }: { children: React.ReactNode }) {
	const [roles, setRoles] = useState<Role[]>([]);

	return (
		<UserRolesContext.Provider
			value={{
				roles,
				setRoles,
			}}>
			{children}
		</UserRolesContext.Provider>
	);
}
