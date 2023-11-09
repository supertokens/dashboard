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

import { useState } from "react";

import { AppEnvContextProvider } from "../../contexts/AppEnvContext";

import { RolesTable } from "../../components/userroles/components/RolesTable";

import Alert from "../../components/alert";
import UserRolesContextProvider from "../../components/userroles/context/UserRolesContext";
import "./index.scss";

export default function UserRolesList() {
	const [isFeatureEnabled, setIsFeatureEnabled] = useState(true);

	return (
		<AppEnvContextProvider
			connectionURI={
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(window as any).connectionURI
			}>
			<UserRolesContextProvider>
				<div className="userroles-container">
					<h1 className="users-list-title">Roles and Permissions</h1>
					<p className="text-small users-list-subtitle">
						One place to manage all your user roles and permissions. Edit roles and permissions according to
						your needs.
					</p>
					{isFeatureEnabled ? (
						<RolesTable setIsFeatureEnabled={setIsFeatureEnabled} />
					) : (
						<Alert
							title="Feature is not enabled"
							content="Please enable this feature first to manage your User Roles and Permissions!"
						/>
					)}
				</div>
			</UserRolesContextProvider>
		</AppEnvContextProvider>
	);
}
