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

import { ReactComponent as PlusIcon } from "../../../../assets/plus.svg";
import Button from "../../button";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "./tenantDetailPanel/TenantDetailPanel";
import { ThirdPartyProviderButton } from "./thirdPartyProviderButton/ThirdPartyProviderButton";

export const ThirdPartySection = ({ handleAddNewProvider }: { handleAddNewProvider: () => void }) => {
	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip tooltip="Configure third-party OAuth 2.0/OIDC/SAML providers available for user sign-in/sign-up">
					Social/Enterprise Providers
				</PanelHeaderTitleWithTooltip>
			</PanelHeader>

			<ThirdPartyProviderButton
				title="Google"
				icon="provider-google.svg"
			/>

			<hr className="tenant-detail__third-party-divider" />

			<Button onClick={handleAddNewProvider}>
				<PlusIcon />
				Add new Provider
			</Button>
		</PanelRoot>
	);
};
