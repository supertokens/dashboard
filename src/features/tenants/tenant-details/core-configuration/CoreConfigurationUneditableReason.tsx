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

import { getConnectionUri } from "@shared/utils";

/**
 * Determines the reason why a property cannot be edited based on the environment
 * and tenant configuration.
 *
 * @param isPublicTenant - Whether the current tenant is the public tenant
 * @returns JSX element or string explaining why the property cannot be edited
 */
export function getUneditableReason(isPublicTenant: boolean): React.ReactNode {
	const connectionURI = getConnectionUri();
	const isUsingSaaS = connectionURI.includes("aws.supertokens.io");
	const isUsingPublicApp = !/appid-.*$/.test(connectionURI);

	if (isUsingSaaS) {
		if (isUsingPublicApp) {
			if (isPublicTenant) {
				// SaaS / public app / public tenant
				return (
					<>
						Please use the <a href="https://supertokens.com/dashboard-saas">SuperTokens SaaS Dashboard</a>{" "}
						to edit this property.
					</>
				);
			} else {
				// SaaS / public app / non-public tenant
				return (
					<>
						Please use the <a href="https://supertokens.com/dashboard-saas">SuperTokens SaaS Dashboard</a>{" "}
						to edit this property.
					</>
				);
			}
		} else {
			if (isPublicTenant) {
				// SaaS / non-public app / public tenant
				return (
					<>
						Please use the Update App API to configure this property. Refer to the{" "}
						<a href="https://supertokens.com/docs/multitenancy/new-app#create-a-new--update-an-app-in-the-core">
							docs
						</a>{" "}
						for more information.
					</>
				);
			} else {
				// SaaS / non-public app / non-public tenant
				return (
					<>
						Please use the Update App API to configure this property. Refer to the{" "}
						<a href="https://supertokens.com/docs/multitenancy/new-app#create-a-new--update-an-app-in-the-core">
							docs
						</a>{" "}
						for more information.
					</>
				);
			}
		}
	} else {
		if (isUsingPublicApp) {
			if (isPublicTenant) {
				// No SaaS (self hosted) / public app / public tenant
				return "This property is configurable only via the config.yaml file or via Docker env variables.";
			} else {
				// No SaaS (self hosted) / public app / non-public tenant
				return "This property is configurable only via the config.yaml file or via Docker env variables.";
			}
		} else {
			if (isPublicTenant) {
				// No SaaS (self hosted) / non-public app / public tenant
				return (
					<>
						Please use the Update App API to configure this property. Refer to the{" "}
						<a href="https://supertokens.com/docs/multitenancy/new-app#create-a-new--update-an-app-in-the-core">
							docs
						</a>{" "}
						for more information.
					</>
				);
			} else {
				// No SaaS (self hosted) / non-public app / non-public tenant
				return (
					<>
						Please use the Update App API to configure this property. Refer to the{" "}
						<a href="https://supertokens.com/docs/multitenancy/new-app#create-a-new--update-an-app-in-the-core">
							docs
						</a>{" "}
						for more information.
					</>
				);
			}
		}
	}
}
