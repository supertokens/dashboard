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

import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import { ThirdPartyProviderButton } from "../thirdPartyProviderButton/ThirdPartyProviderButton";
import { ThirdPartyProviderInput } from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import { ClientConfig } from "./ClientConfig";
import "./thirdPartyProviderConfig.scss";

export const BuiltInProviderInfo = () => {
	return (
		<PanelRoot>
			<PanelHeader>
				<div className="built-in-provider-config-header">
					<PanelHeaderTitleWithTooltip>Built-In Provider Configuration</PanelHeaderTitleWithTooltip>
					<ThirdPartyProviderButton
						title="Google"
						icon="provider-google.svg"
						disabled
					/>
				</div>
			</PanelHeader>
			<div className="fields-container">
				<ThirdPartyProviderInput
					label="Third Party Id"
					tooltip="The client ID of the third-party provider."
					type="text"
					name="clientID"
					value="google"
					isRequired
					disabled
					handleChange={() => null}
				/>
				<ClientConfig />
			</div>
		</PanelRoot>
	);
};
