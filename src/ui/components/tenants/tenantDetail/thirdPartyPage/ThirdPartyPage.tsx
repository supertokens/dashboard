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
import { IN_BUILT_THIRD_PARTY_PROVIDERS } from "../../../../../constants";
import { getImageUrl } from "../../../../../utils";
import { TenantDetailHeader } from "../TenantDetailHeader";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import { ThirdPartyProviderButton } from "../thirdPartyProviderButton/ThirdPartyProviderButton";
import "./thirdPartyPage.scss";

export const ThirdPartyPage = ({ handleGoBack }: { handleGoBack: () => void }) => {
	return (
		<div className="third-party-section">
			<button
				className="button flat"
				onClick={handleGoBack}>
				<img
					src={getImageUrl("left-arrow-dark.svg")}
					alt="Go back"
				/>
				<span>Back to tenant info</span>
			</button>
			<div className="third-party-section__cards">
				<TenantDetailHeader onlyShowTenantId />
				<ThirdPartyProvidersList />
			</div>
		</div>
	);
};

const ThirdPartyProvidersList = () => {
	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip>Add new Social / Enterprise Login Provider</PanelHeaderTitleWithTooltip>
			</PanelHeader>
			<div className="provider-list-header">
				Select the Provider that you want to add for you tenant from the list below
			</div>
			<div className="provider-list-container">
				<h2 className="provider-list-container__header-with-divider">Built-In OAuth Providers</h2>
				<div className="provider-list-container__providers-grid">
					{IN_BUILT_THIRD_PARTY_PROVIDERS.map((provider) => {
						return (
							<ThirdPartyProviderButton
								key={provider.id}
								title={provider.label}
								icon={provider.icon}
							/>
						);
					})}
				</div>
				<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
					Custom OAuth Providers
				</h2>
				<div className="provider-list-container__providers-grid">
					<ThirdPartyProviderButton
						title="Add Custom Provider"
						type="without-icon"
					/>
				</div>
				<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
					SAML
				</h2>
				<div className="provider-list-container__providers-grid">
					<ThirdPartyProviderButton
						title="Add SAML Provider"
						type="without-icon"
					/>
				</div>
			</div>
		</PanelRoot>
	);
};
