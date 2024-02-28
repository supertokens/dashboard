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
import { useState } from "react";
import { BuiltInProvidersCustomFields, ProviderClientConfig, ProviderConfig } from "../../../../../api/tenants/types";
import { IN_BUILT_THIRD_PARTY_PROVIDERS } from "../../../../../constants";
import Button from "../../../button";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import { ThirdPartyProviderButton } from "../thirdPartyProviderButton/ThirdPartyProviderButton";
import { ThirdPartyProviderInput } from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import { ClientConfig } from "./ClientConfig";
import "./thirdPartyProviderConfig.scss";

export const BuiltInProviderInfo = ({
	providerId,
	providerConfig,
	handleGoBack,
}: {
	providerId: string;
	providerConfig?: ProviderConfig;
	handleGoBack: () => void;
}) => {
	const [providerConfigState, setProviderConfigState] = useState<ProviderConfig>(
		providerConfig ?? getBuiltInInitialProviderInfo(providerId)
	);
	const inBuiltProviderInfo = IN_BUILT_THIRD_PARTY_PROVIDERS.find((provider) => providerId.startsWith(provider.id));
	const customFieldProviderKey = Object.keys(IN_BUILT_PROVIDERS_CUSTOM_FIELDS).find((id) =>
		providerId.startsWith(id)
	);
	const customFields = customFieldProviderKey ? IN_BUILT_PROVIDERS_CUSTOM_FIELDS[customFieldProviderKey] : undefined;

	const handleAddNewClient = () => {
		let additionalConfigFields = {};

		if (customFields?.additionalConfigFields) {
			additionalConfigFields = customFields?.additionalConfigFields.reduce((acc, field) => {
				acc[field.id] = "";
				return acc;
			}, {} as Record<string, string>);
		}

		setProviderConfigState((prev) => ({
			...prev,
			clients: [
				...(prev?.clients ?? []),
				{ clientId: "", clientSecret: "", scopes: [], additionalConfig: additionalConfigFields },
			],
		}));
	};

	return (
		<PanelRoot>
			<PanelHeader>
				<div className="built-in-provider-config-header">
					<PanelHeaderTitleWithTooltip>Built-In Provider Configuration</PanelHeaderTitleWithTooltip>
					<ThirdPartyProviderButton
						title={inBuiltProviderInfo?.label ?? ""}
						icon={inBuiltProviderInfo?.icon ?? ""}
						disabled
					/>
				</div>
			</PanelHeader>
			<div className="fields-container">
				<ThirdPartyProviderInput
					label="Third Party Id"
					tooltip="The Id of the provider."
					type="text"
					name="thirdPartyId"
					value={providerId}
					isRequired
					disabled
					handleChange={() => null}
				/>
				{customFields?.fields?.map((field) => (
					<ThirdPartyProviderInput
						key={field.id}
						label={field.label}
						tooltip={field.tooltip}
						type={field.type}
						name={field.id}
						value={providerConfigState[field.id as keyof ProviderConfig] as string}
						isRequired={field.required}
						handleChange={(value) => {
							setProviderConfigState((prev) => ({ ...prev, [field.id]: value }));
						}}
					/>
				))}
				{providerConfigState.clients?.map((client, index) => (
					<ClientConfig
						key={index}
						providerId={providerId}
						clientsCount={providerConfigState.clients?.length ?? 0}
						client={client}
						setClient={(client: ProviderClientConfig) => {
							setProviderConfigState((prev) => ({
								...prev,
								clients: prev.clients?.map((c, i) => (i === index ? client : c)),
							}));
						}}
						additionalConfigFields={customFields?.additionalConfigFields}
						handleDeleteClient={() => {
							setProviderConfigState((prev) => ({
								...prev,
								clients: prev.clients?.filter((_, i) => i !== index),
							}));
						}}
					/>
				))}
			</div>
			<hr className="built-in-provider-divider" />
			<div className="built-in-provider-footer">
				<Button
					color="blue-outline"
					onClick={handleAddNewClient}>
					+ Add New Client
				</Button>
				<div className="built-in-provider-footer__primary-ctas">
					<Button
						color="gray-outline"
						onClick={handleGoBack}>
						Go Back
					</Button>
					<Button onClick={() => null}>Save</Button>
				</div>
			</div>
		</PanelRoot>
	);
};

const getBuiltInInitialProviderInfo = (providerId: string): ProviderConfig => {
	let baseProviderConfig = {
		thirdPartyId: providerId,
		clients: [{ clientId: "", clientSecret: "", scopes: [], additionalConfig: {} }],
	};

	const customFieldProviderKey = Object.keys(IN_BUILT_PROVIDERS_CUSTOM_FIELDS).find((id) =>
		providerId.startsWith(id)
	);
	const customFields = customFieldProviderKey ? IN_BUILT_PROVIDERS_CUSTOM_FIELDS[customFieldProviderKey] : undefined;

	if (customFields === undefined) {
		return baseProviderConfig;
	}

	const additionalConfigFields = customFields.additionalConfigFields ?? [];
	const fields = customFields.fields ?? [];

	if (additionalConfigFields.length > 0) {
		const additionalConfig = additionalConfigFields.reduce((acc, field) => {
			acc[field.id] = "";
			return acc;
		}, {} as Record<string, string>);

		baseProviderConfig.clients[0].additionalConfig = additionalConfig;
	}

	if (fields.length > 0) {
		const fieldsConfig = fields.reduce((acc, field) => {
			acc[field.id] = "";
			return acc;
		}, {} as Record<string, string>);

		baseProviderConfig = {
			...baseProviderConfig,
			...fieldsConfig,
		};
	}

	return baseProviderConfig;
};

const IN_BUILT_PROVIDERS_CUSTOM_FIELDS: BuiltInProvidersCustomFields = {
	apple: {
		additionalConfigFields: [
			{
				label: "Key Id",
				id: "keyId",
				tooltip: "The key Id for Apple.",
				type: "text",
				required: true,
			},
			{
				label: "Team Id",
				id: "teamId",
				tooltip: "The team Id for Apple.",
				type: "text",
				required: true,
			},
			{
				label: "Private Key",
				id: "privateKey",
				tooltip: "The private key for Apple.",
				type: "text",
				required: true,
			},
		],
	},
	"google-workspaces": {
		additionalConfigFields: [
			{
				label: "Hosted Domain",
				id: "hd",
				tooltip: "The hosted domain for Google Workspaces.",
				type: "text",
				required: false,
			},
		],
	},
	gitlab: {
		fields: [
			{
				label: "OIDC Discovery Endpoint",
				id: "oidcDiscoveryEndpoint",
				tooltip: "The OIDC discovery endpoint for Gitlab, if you are using a self-hosted Gitlab instance.",
				type: "text",
				required: false,
			},
		],
	},

	"active-directory": {
		fields: [
			{
				label: "OIDC Discovery Endpoint",
				id: "oidcDiscoveryEndpoint",
				tooltip:
					"The OIDC discovery endpoint for your Active Directory account, that will be used to fetch the OIDC endpoints.",
				type: "text",
				required: false,
			},
		],
		additionalConfigFields: [
			{
				label: "Directory Id",
				id: "directoryId",
				tooltip:
					"The id of the Microsoft Entra tenant, this is required if OIDC discovery endpoint is not provided.",
				type: "text",
				required: false,
			},
		],
	},
	okta: {
		fields: [
			{
				label: "OIDC Discovery Endpoint",
				id: "oidcDiscoveryEndpoint",
				tooltip:
					"The OIDC discovery	 endpoint for your Okta account, that will be used to fetch the OIDC endpoints.",
				type: "text",
				required: false,
			},
		],
		additionalConfigFields: [
			{
				label: "Okta Domain",
				id: "oktaDomain",
				tooltip:
					"The domain of your Okta account, this is required if OIDC discovery endpoint is not provided.",
				type: "text",
				required: false,
			},
		],
	},
};
