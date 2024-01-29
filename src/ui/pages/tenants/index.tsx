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

import { AppEnvContextProvider } from "../../contexts/AppEnvContext";
import "./index.scss";

export default function TenantManagement() {
	return (
		<AppEnvContextProvider
			connectionURI={
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(window as any).connectionURI
			}>
			<div className="tenants-container">
				<h1 className="tenants-title">Tenant Management</h1>
				<p className="text-small tenants-subtitle">
					One place to manage all your tenants. Create or edit tenants and their login methods according to
					your needs.
				</p>
				{/* {renderContent()} */}
			</div>
		</AppEnvContextProvider>
	);
}
