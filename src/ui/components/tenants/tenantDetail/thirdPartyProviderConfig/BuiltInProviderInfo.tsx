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
import { useContext, useState } from "react";
import { useThirdPartyService } from "../../../../../api/tenants";
import { BuiltInProvidersCustomFields, ProviderClientConfig, ProviderConfig } from "../../../../../api/tenants/types";
import { IN_BUILT_THIRD_PARTY_PROVIDERS } from "../../../../../constants";
import { getImageUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { DeleteThirdPartyProviderDialog } from "../deleteThirdPartyProvider/DeleteThirdPartyProvider";
import { useTenantDetailContext } from "../TenantDetailContext";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import { ThirdPartyProviderButton } from "../thirdPartyProviderButton/ThirdPartyProviderButton";
import { ThirdPartyProviderInput } from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import { ClientConfig } from "./ClientConfig";
import "./thirdPartyProviderConfig.scss";

export const BuiltInProviderInfo = ({
	providerId,
	providerConfig,
	handleGoBack,
	isAddingNewProvider,
}: {
	providerId: string;
	providerConfig?: ProviderConfig;
	handleGoBack: (shouldGoBackToDetailPage?: boolean) => void;
	isAddingNewProvider: boolean;
}) => {
	const [providerConfigState, setProviderConfigState] = useState<ProviderConfig>(
		providerConfig ?? getBuiltInInitialProviderInfo(providerId)
	);
	const [errorState, setErrorState] = useState<Record<string, string>>({});
	const [isDeleteProviderDialogOpen, setIsDeleteProviderDialogOpen] = useState(false);
	const { tenantInfo, refetchTenant } = useTenantDetailContext();
	const [isSaving, setIsSaving] = useState(false);
	const { showToast } = useContext(PopupContentContext);
	const { createOrUpdateThirdPartyProvider } = useThirdPartyService();
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
				{ clientId: "", clientSecret: "", scope: [""], additionalConfig: additionalConfigFields },
			],
		}));
	};

	const handleSave = async () => {
		const isAppleProvider = providerId.startsWith("apple");
		let isValid = true;

		setErrorState({});

		const clientTypes = new Set<string>();
		providerConfigState.clients?.forEach((client, index) => {
			if (typeof client.clientId !== "string" || client.clientId.trim() === "") {
				setErrorState((prev) => ({ ...prev, [`clients.${index}.clientId`]: "Client Id is required" }));
				isValid = false;
			}
			if (!isAppleProvider) {
				if (typeof client.clientSecret !== "string" || client.clientSecret.trim() === "") {
					setErrorState((prev) => ({
						...prev,
						[`clients.${index}.clientSecret`]: "Client Secret is required",
					}));
					isValid = false;
				}
			}
			if ((providerConfigState.clients?.length ?? 0) > 1) {
				if (typeof client.clientType !== "string" || client.clientType.trim() === "") {
					setErrorState((prev) => ({ ...prev, [`clients.${index}.clientType`]: "Client Type is required" }));
					isValid = false;
					return;
				}
				if (clientTypes.has(client.clientType)) {
					setErrorState((prev) => ({
						...prev,
						[`clients.${index}.clientType`]: "Client Type should be unique",
					}));
					isValid = false;
				}
				clientTypes.add(client.clientType);
			}
		});

		if (customFields?.fields) {
			customFields.fields.forEach((field) => {
				if (
					field.required &&
					(typeof providerConfigState[field.id as keyof ProviderConfig] !== "string" ||
						providerConfigState[field.id as keyof ProviderConfig] === "")
				) {
					setErrorState((prev) => ({ ...prev, [field.id]: `${field.label} is required` }));
					isValid = false;
				}
			});
		}

		if (customFields?.additionalConfigFields) {
			providerConfigState.clients?.forEach((client, index) => {
				customFields.additionalConfigFields?.forEach((field) => {
					if (
						field.required &&
						(typeof client.additionalConfig?.[field.id] !== "string" ||
							client.additionalConfig[field.id] === "")
					) {
						setErrorState((prev) => ({
							...prev,
							[`clients.${index}.additionalConfig.${field.id}`]: `${field.label} is required`,
						}));
						isValid = false;
					}
				});
			});
		}

		if (customFields?.oneOfFieldsOrAdditionalConfigRequired) {
			const { field, additionalConfig } = customFields.oneOfFieldsOrAdditionalConfigRequired;
			if (
				providerConfigState[field as keyof ProviderConfig] === "" &&
				providerConfigState.clients?.some((client) => client.additionalConfig?.[additionalConfig] === "")
			) {
				setErrorState((prev) => ({ ...prev, [field]: `${field} or ${additionalConfig} is required` }));
				isValid = false;
			}
		}

		if (isValid) {
			const normalizedProviderConfig = {
				name: inBuiltProviderInfo?.label,
				...providerConfigState,
			};

			normalizedProviderConfig.clients = normalizedProviderConfig.clients?.map((client) => {
				const normalizedScopes = client.scope?.filter((scope) => scope && scope?.trim() !== "") ?? [];
				return { ...client, scope: normalizedScopes.length === 0 ? null : normalizedScopes };
			});

			try {
				setIsSaving(true);
				await createOrUpdateThirdPartyProvider(tenantInfo.tenantId, normalizedProviderConfig);
				await refetchTenant();
				handleGoBack(true);
			} catch (e) {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Something went wrong!, Failed to save the provider!</>,
				});
			} finally {
				setIsSaving(false);
			}
		}
	};

	return (
		<PanelRoot>
			<PanelHeader>
				<div className="built-in-provider-config-header">
					<div className="built-in-provider-config-header__title">
						<PanelHeaderTitleWithTooltip>Built-In Provider Configuration</PanelHeaderTitleWithTooltip>
						<ThirdPartyProviderButton
							title={inBuiltProviderInfo?.label ?? ""}
							icon={inBuiltProviderInfo?.icon ?? ""}
							disabled
						/>
					</div>
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
						error={errorState[field.id]}
						forceShowError
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
						clientIndex={index}
						errors={errorState}
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
			<hr className="provider-config-divider" />
			<div className="built-in-provider-footer">
				<Button
					color="blue-outline"
					onClick={handleAddNewClient}>
					+ Add New Client
				</Button>
				<div className="built-in-provider-footer__primary-ctas">
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
					thirdPartyId={providerId}
					goBack={() => handleGoBack(true)}
				/>
			)}
		</PanelRoot>
	);
};

const getBuiltInInitialProviderInfo = (providerId: string) => {
	let baseProviderConfig = {
		thirdPartyId: providerId,
		clients: [{ clientId: "", clientSecret: "", scope: [""], additionalConfig: {} }],
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
				required: true,
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
		oneOfFieldsOrAdditionalConfigRequired: {
			field: "oidcDiscoveryEndpoint",
			additionalConfig: "directoryId",
		},
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
		oneOfFieldsOrAdditionalConfigRequired: {
			field: "oidcDiscoveryEndpoint",
			additionalConfig: "oktaDomain",
		},
	},
};
