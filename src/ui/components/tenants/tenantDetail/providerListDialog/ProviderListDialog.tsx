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
import { TenantDashboardView } from "../../../../../api/tenants/types";
import { IN_BUILT_THIRD_PARTY_PROVIDERS, SAML_PROVIDER_ID } from "../../../../../constants";
import Button from "../../../button";
import { Dialog, DialogContent } from "../../../dialog";
import { ThirdPartyProviderButton } from "../thirdPartyProviderButton/ThirdPartyProviderButton";
import "./thirdPartyProvidersList.scss";

export const ProviderListDialog = ({
	handleAddNewProvider,
	onCloseDialog,
}: {
	handleAddNewProvider: (view: TenantDashboardView) => void;
	onCloseDialog: () => void;
}) => {
	const handleAddNewInBuiltProvider = (providerId: string) => {
		window.scrollTo(0, 0);
		handleAddNewProvider({
			view: "add-or-edit-third-party-provider",
			thirdPartyId: providerId,
			isAddingNewProvider: true,
		});
	};

	return (
		<Dialog
			onCloseDialog={onCloseDialog}
			closeOnOverlayClick
			className="provider-dialog-container">
			<DialogContent>
				<div>
					<h2 className="provider-list-title">Add new Social / Enterprise Login Provider</h2>
					<hr className="provider-list-divider" />
					<div className="provider-list-header">
						Select the Provider that you want to add for you tenant from the list below
					</div>
					<div className="provider-list-container">
						<h2 className="provider-list-container__header-with-divider">Enterprise Providers</h2>
						<div className="provider-list-container__providers-grid">
							{IN_BUILT_THIRD_PARTY_PROVIDERS.filter((provider) => provider.isEnterprise).map(
								(provider) => {
									return (
										<ThirdPartyProviderButton
											key={provider.id}
											title={provider.label}
											icon={provider.icon}
											onClick={() => handleAddNewInBuiltProvider(provider.id)}
										/>
									);
								}
							)}
						</div>
						<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
							Social Providers
						</h2>
						<div className="provider-list-container__providers-grid">
							{IN_BUILT_THIRD_PARTY_PROVIDERS.filter((provider) => !provider.isEnterprise).map(
								(provider) => {
									return (
										<ThirdPartyProviderButton
											key={provider.id}
											title={provider.label}
											icon={provider.icon}
											onClick={() => handleAddNewInBuiltProvider(provider.id)}
										/>
									);
								}
							)}
						</div>
						<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
							Custom OAuth Providers
						</h2>
						<div className="provider-list-container__providers-grid">
							<ThirdPartyProviderButton
								title="Add Custom Provider"
								type="without-icon"
								onClick={() => {
									window.scrollTo(0, 0);
									handleAddNewProvider({
										view: "add-or-edit-third-party-provider",
										isAddingNewProvider: true,
									});
								}}
							/>
						</div>
						<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
							SAML
						</h2>
						<div className="provider-list-container__providers-grid">
							<ThirdPartyProviderButton
								title="Add SAML Provider"
								type="without-icon"
								onClick={() => handleAddNewInBuiltProvider(SAML_PROVIDER_ID)}
							/>
						</div>
					</div>
				</div>
			</DialogContent>
			<div className="providers-list-footer">
				<Button
					color="gray-outline"
					onClick={onCloseDialog}>
					Cancel
				</Button>
			</div>
		</Dialog>
	);
};
