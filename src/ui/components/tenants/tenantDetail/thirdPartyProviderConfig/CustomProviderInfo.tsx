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
import { ChangeEvent, useContext, useState } from "react";
import { useThirdPartyService } from "../../../../../api/tenants";
import { ProviderClientConfig, ProviderConfig } from "../../../../../api/tenants/types";
import { ReactComponent as InfoIcon } from "../../../../../assets/info-icon.svg";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import TooltipContainer from "../../../tooltip/tooltip";
import { DeleteThirdPartyProviderDialog } from "../deleteThirdPartyProvider/DeleteThirdPartyProvider";
import { KeyValueInput } from "../keyValueInput/KeyValueInput";
import { useTenantDetailContext } from "../TenantDetailContext";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import { ThirdPartyProviderInput } from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import { ClientConfig } from "./ClientConfig";
import "./thirdPartyProviderConfig.scss";

export const CustomProviderInfo = ({
	providerId,
	providerConfig,
	handleGoBack,
	isAddingNewProvider,
}: {
	providerId?: string;
	providerConfig?: ProviderConfig;
	handleGoBack: (shouldGoBackToDetailPage?: boolean) => void;
	isAddingNewProvider: boolean;
}) => {
	const [providerConfigState, setProviderConfigState] = useState(getInitialProviderInfo(providerConfig));
	const [errorState, setErrorState] = useState<Record<string, string>>({});
	const [isDeleteProviderDialogOpen, setIsDeleteProviderDialogOpen] = useState(false);
	const { tenantInfo, refetchTenant } = useTenantDetailContext();
	const [isSaving, setIsSaving] = useState(false);
	const { showToast } = useContext(PopupContentContext);
	const { createOrUpdateThirdPartyProvider } = useThirdPartyService();

	const handleAddNewClient = () => {
		setProviderConfigState((prev) => ({
			...prev,
			clients: [...(prev?.clients ?? []), { clientId: "", clientSecret: "", scope: [""] }],
		}));
	};

	const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.type === "change") {
			setProviderConfigState({ ...providerConfigState, [e.target.name]: e.target.value });
		}
	};

	const handleUserInfoFieldChange = (
		infoType: "fromIdTokenPayload" | "fromUserInfoAPI",
		name: string,
		value: string
	) => {
		setProviderConfigState((prev) => ({
			...prev,
			userInfoMap: {
				...prev.userInfoMap,
				[infoType]: {
					...prev.userInfoMap[infoType],
					[name]: value,
				},
			},
		}));
	};

	const handleSave = async () => {
		setIsSaving(true);
	};

	return (
		<PanelRoot>
			<PanelHeader>
				<div className="built-in-provider-config-header">
					<PanelHeaderTitleWithTooltip>Custom Provider Configuration</PanelHeaderTitleWithTooltip>
					{!isAddingNewProvider && (
						<Button
							color="danger"
							onClick={() => setIsDeleteProviderDialogOpen(true)}>
							Delete
						</Button>
					)}
				</div>
			</PanelHeader>
			<div className="fields-container">
				<ThirdPartyProviderInput
					label="Third Party Id"
					tooltip="The Id of the provider."
					type="text"
					name="thirdPartyId"
					value={providerConfigState.thirdPartyId}
					disabled={!isAddingNewProvider}
					isRequired
					handleChange={handleFieldChange}
					minLabelWidth={120}
				/>
				<ThirdPartyProviderInput
					label="Name"
					tooltip="The name of the provider."
					type="text"
					name="name"
					value={providerConfigState.name}
					isRequired
					minLabelWidth={120}
					handleChange={handleFieldChange}
				/>
				<div className="custom-provider-divider" />
				<div className="custom-provider-client-config">
					<div className="custom-provider-client-config__header">Clients</div>
					{providerConfigState.clients?.map((client, index) => (
						<ClientConfig
							key={index}
							providerId={providerConfigState.thirdPartyId}
							clientsCount={providerConfigState.clients?.length ?? 0}
							client={client}
							clientIndex={index}
							errors={errorState}
							setClient={(client: ProviderClientConfig) => {
								setProviderConfigState((prev) => ({
									...prev,
									clients: prev.clients?.map((c, i) => (i === index ? client : c)),
								}));
							}}
							handleDeleteClient={() => {
								setProviderConfigState((prev) => ({
									...prev,
									clients: prev.clients?.filter((_, i) => i !== index),
								}));
							}}
						/>
					))}
					<button
						className="custom-provider-client-config__add-new"
						onClick={handleAddNewClient}>
						+ Add New Client
					</button>
				</div>
				<div className="custom-provider-divider" />
				<ThirdPartyProviderInput
					label="oidcDiscoveryEndpoint"
					tooltip="The OIDC discovery endpoint of the provider."
					type="text"
					name="oidcDiscoveryEndpoint"
					value={providerConfigState.oidcDiscoveryEndpoint}
					isRequired
					handleChange={handleFieldChange}
				/>
				<div className="custom-provider-divider" />
				<ThirdPartyProviderInput
					label="Authorization Endpoint"
					tooltip="The authorization endpoint of the provider."
					type="text"
					name="authorizationEndpoint"
					value={providerConfigState.authorizationEndpoint}
					isRequired
					handleChange={handleFieldChange}
				/>
				<KeyValueInput
					label="Authorization Endpoint Query Params"
					tooltip="The query params to be sent to the authorization endpoint."
					value={providerConfigState.authorizationEndpointQueryParams as Array<[string, string]>}
					onChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, authorizationEndpointQueryParams: value }));
					}}
				/>
				<div className="custom-provider-divider" />
				<ThirdPartyProviderInput
					label="Token Endpoint"
					tooltip="The token endpoint of the provider."
					type="text"
					name="tokenEndpoint"
					value={providerConfigState.tokenEndpoint}
					isRequired
					handleChange={handleFieldChange}
				/>
				<KeyValueInput
					label="Token Endpoint Body Params"
					tooltip="The body params to be sent to the token endpoint."
					value={providerConfigState.tokenEndpointBodyParams as Array<[string, string]>}
					onChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, tokenEndpointBodyParams: value }));
					}}
				/>
				<div className="custom-provider-divider" />

				<ThirdPartyProviderInput
					label="User Info Endpoint"
					tooltip="The user info endpoint of the provider."
					type="text"
					name="userInfoEndpoint"
					value={providerConfigState.userInfoEndpoint}
					isRequired
					handleChange={handleFieldChange}
				/>

				<div className="user-info-map">
					<div className="user-info-map__label-container">
						<TooltipContainer
							tooltip="The mapping of the user info fields to the user info endpoint."
							position="bottom">
							<InfoIcon />
						</TooltipContainer>

						<div className="user-info-map__label">User Info Map from Info API:</div>
					</div>
					<div className="user-info-map__fields-container">
						<ThirdPartyProviderInput
							label="userId"
							type="text"
							name="userId"
							minLabelWidth={130}
							value={providerConfigState.userInfoMap.fromUserInfoAPI.userId}
							handleChange={(e) => handleUserInfoFieldChange("fromUserInfoAPI", "userId", e.target.value)}
						/>
						<ThirdPartyProviderInput
							label="email"
							type="text"
							name="email"
							minLabelWidth={130}
							value={providerConfigState.userInfoMap.fromUserInfoAPI.email}
							handleChange={(e) => handleUserInfoFieldChange("fromUserInfoAPI", "email", e.target.value)}
						/>
						<ThirdPartyProviderInput
							label="emailVerified"
							type="text"
							name="emailVerified"
							minLabelWidth={130}
							value={providerConfigState.userInfoMap.fromUserInfoAPI.emailVerified}
							handleChange={(e) =>
								handleUserInfoFieldChange("fromUserInfoAPI", "emailVerified", e.target.value)
							}
						/>
					</div>
				</div>

				<div className="user-info-map">
					<div className="user-info-map__label-container">
						<TooltipContainer
							tooltip="The mapping of the user info fields to the ID token payload."
							position="bottom">
							<InfoIcon />
						</TooltipContainer>

						<div className="user-info-map__label">User Info Map from ID Token Payload:</div>
					</div>
					<div className="user-info-map__fields-container">
						<ThirdPartyProviderInput
							label="userId"
							type="text"
							name="userId"
							minLabelWidth={130}
							value={providerConfigState.userInfoMap.fromIdTokenPayload.userId}
							handleChange={(e) =>
								handleUserInfoFieldChange("fromIdTokenPayload", "userId", e.target.value)
							}
						/>
						<ThirdPartyProviderInput
							label="email"
							type="text"
							name="email"
							minLabelWidth={130}
							value={providerConfigState.userInfoMap.fromIdTokenPayload.email}
							handleChange={(e) =>
								handleUserInfoFieldChange("fromIdTokenPayload", "email", e.target.value)
							}
						/>
						<ThirdPartyProviderInput
							label="emailVerified"
							type="text"
							name="emailVerified"
							minLabelWidth={130}
							value={providerConfigState.userInfoMap.fromIdTokenPayload.emailVerified}
							handleChange={(e) =>
								handleUserInfoFieldChange("fromIdTokenPayload", "emailVerified", e.target.value)
							}
						/>
					</div>
				</div>
			</div>
			<hr className="provider-config-divider" />
			<div className="custom-provider-footer">
				<div className="custom-provider-footer__primary-ctas">
					<Button
						color="gray-outline"
						onClick={() => handleGoBack()}>
						Go Back
					</Button>
					<Button
						onClick={handleSave}
						isLoading={isSaving}
						disabled={isSaving}>
						Save
					</Button>
				</div>
			</div>
			{isDeleteProviderDialogOpen && (
				<DeleteThirdPartyProviderDialog
					onCloseDialog={() => setIsDeleteProviderDialogOpen(false)}
					thirdPartyId={providerId ?? ""}
					goBack={() => handleGoBack(true)}
				/>
			)}
		</PanelRoot>
	);
};

const getInitialProviderInfo = (providerConfig: ProviderConfig | undefined) => {
	if (providerConfig !== undefined) {
		return {
			...providerConfig,
			name: providerConfig.name ?? "",
			authorizationEndpoint: providerConfig.authorizationEndpoint ?? "",
			tokenEndpoint: providerConfig.tokenEndpoint ?? "",
			userInfoEndpoint: providerConfig.userInfoEndpoint ?? "",
			jwksURI: providerConfig.jwksURI ?? "",
			oidcDiscoveryEndpoint: providerConfig.oidcDiscoveryEndpoint ?? "",
			requireEmail: providerConfig.requireEmail ?? false,
			userInfoMap: {
				fromIdTokenPayload: {
					userId: providerConfig.userInfoMap?.fromIdTokenPayload?.userId ?? "",
					email: providerConfig.userInfoMap?.fromIdTokenPayload?.email ?? "",
					emailVerified: providerConfig.userInfoMap?.fromIdTokenPayload?.emailVerified ?? "",
				},
				fromUserInfoAPI: {
					userId: providerConfig.userInfoMap?.fromUserInfoAPI?.userId ?? "",
					email: providerConfig.userInfoMap?.fromUserInfoAPI?.email ?? "",
					emailVerified: providerConfig.userInfoMap?.fromUserInfoAPI?.emailVerified ?? "",
				},
			},
			tokenEndpointBodyParams: providerConfig.tokenEndpointBodyParams
				? Object.entries(providerConfig.tokenEndpointBodyParams)
				: [["", ""]],
			authorizationEndpointQueryParams: providerConfig.authorizationEndpointQueryParams
				? Object.entries(providerConfig.authorizationEndpointQueryParams)
				: [["", ""]],
			userInfoEndpointQueryParams: providerConfig.userInfoEndpointQueryParams
				? Object.entries(providerConfig.userInfoEndpointQueryParams)
				: [["", ""]],
			userInfoEndpointHeaders: providerConfig.userInfoEndpointHeaders
				? Object.entries(providerConfig.userInfoEndpointHeaders)
				: [["", ""]],
		};
	}

	return {
		thirdPartyId: "",
		name: "",
		authorizationEndpoint: "",
		authorizationEndpointQueryParams: [["", ""]],
		tokenEndpoint: "",
		tokenEndpointBodyParams: [["", ""]],
		userInfoEndpoint: "",
		userInfoEndpointQueryParams: [["", ""]],
		userInfoEndpointHeaders: [["", ""]],
		jwksURI: "",
		oidcDiscoveryEndpoint: "",
		userInfoMap: {
			fromIdTokenPayload: {
				userId: "",
				email: "",
				emailVerified: "",
			},
			fromUserInfoAPI: {
				userId: "",
				email: "",
				emailVerified: "",
			},
		},
		requireEmail: false,
		clients: [{ clientId: "", clientSecret: "", scope: [""] }],
	};
};
