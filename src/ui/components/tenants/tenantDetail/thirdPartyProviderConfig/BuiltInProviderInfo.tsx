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
import { BuiltInProvidersCustomFields, ProviderClientConfig, ProviderConfig } from "../../../../../api/tenants/types";
import { IN_BUILT_THIRD_PARTY_PROVIDERS, SAML_PROVIDER_ID } from "../../../../../constants";
import { getImageUrl, isValidHttpUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { DeleteThirdPartyProviderDialog } from "../deleteThirdPartyProvider/DeleteThirdPartyProvider";
import { useTenantDetailContext } from "../TenantDetailContext";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import { ProviderInfoProps } from "../thirdPartyPage/types";
import { ThirdPartyProviderButton } from "../thirdPartyProviderButton/ThirdPartyProviderButton";
import { ThirdPartyProviderInput } from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import { ClientConfig } from "./ClientConfig";
import "./thirdPartyProviderConfig.scss";

type BuiltInProviderInfoProps = ProviderInfoProps & {
	providerId: string;
};

export const BuiltInProviderInfo = ({
	providerId,
	providerConfig,
	handleGoBack,
	isAddingNewProvider,
	handlePostSaveProviders,
}: BuiltInProviderInfoProps) => {
	const [providerConfigState, setProviderConfigState] = useState<ProviderConfig>(
		getBuiltInProviderInfo(providerId, providerConfig)
	);
	const [errorState, setErrorState] = useState<Record<string, string>>({});
	const [isDeleteProviderDialogOpen, setIsDeleteProviderDialogOpen] = useState(false);
	const { tenantInfo } = useTenantDetailContext();
	const [isSaving, setIsSaving] = useState(false);
	const [hasAddedBoxyURLForNewSAMLProvider, setHasAddedBoxyURLForNewSAMLProvider] = useState(false);
	const { showToast } = useContext(PopupContentContext);
	const { createOrUpdateThirdPartyProvider } = useThirdPartyService();
	const inBuiltProviderInfo = IN_BUILT_THIRD_PARTY_PROVIDERS.find((provider) => providerId.startsWith(provider.id));
	const isSAMLProvider = providerId.startsWith(SAML_PROVIDER_ID);
	const baseProviderId = isSAMLProvider ? SAML_PROVIDER_ID : inBuiltProviderInfo?.id ?? "";
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

	const handleThirdPartyIdSuffixChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.type !== "change") {
			return;
		}

		if (e.target.value.trim() === "") {
			setProviderConfigState((prev) => ({ ...prev, thirdPartyId: baseProviderId }));
		} else {
			setProviderConfigState((prev) => ({
				...prev,
				thirdPartyId: `${baseProviderId}-${e.target.value.trim()}`,
			}));
		}
	};

	const handleSAMLIntroContinue = () => {
		const boxyURL = providerConfigState.clients?.[0].additionalConfig?.boxyURL as string;
		if (!isValidHttpUrl(boxyURL)) {
			setErrorState((prev) => ({
				...prev,
				"clients.0.additionalConfig.boxyURL": "Please enter a valid URL",
			}));
			return;
		}
		window.scrollTo(0, 0);
		setHasAddedBoxyURLForNewSAMLProvider(true);
		setErrorState({});
	};

	const handleSave = async () => {
		const isAppleProvider = providerId.startsWith("apple");
		let isValid = true;

		const doesThirdPartyIdExist = tenantInfo.thirdParty.providers.some(
			(providerId) => providerId === providerConfigState.thirdPartyId
		);

		setErrorState({});

		if (!providerConfigState.thirdPartyId.match(/^[a-z0-9-]+$/)) {
			setErrorState((prev) => ({
				...prev,
				thirdPartyId: "Third Party Id can only contain lowercase alphabets, numbers and hyphens",
			}));
			isValid = false;
		} else if (doesThirdPartyIdExist && isAddingNewProvider) {
			setErrorState((prev) => ({
				...prev,
				thirdPartyId:
					baseProviderId === providerConfigState.thirdPartyId
						? `You need to add a suffix for this provider since you have already added a ${
								isSAMLProvider ? "SAML" : inBuiltProviderInfo?.label
						  } provider`
						: "Third Party Id already exists",
			}));
			isValid = false;
		}

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

		if (customFields?.additionalConfigFields) {
			providerConfigState.clients?.forEach((client, index) => {
				customFields.additionalConfigFields?.forEach((field) => {
					if (
						field.required &&
						(typeof client.additionalConfig?.[field.id] !== "string" ||
							(client.additionalConfig[field.id] as string).trim() === "")
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

		if (isValid) {
			const normalizedProviderConfig = {
				name: isSAMLProvider ? "SAML" : inBuiltProviderInfo?.label,
				...providerConfigState,
			};

			normalizedProviderConfig.clients = normalizedProviderConfig.clients?.map((client) => {
				const normalizedScopes = client.scope?.filter((scope) => scope && scope?.trim() !== "") ?? [];
				return {
					...client,
					clientId: client.clientId.trim(),
					clientType: client.clientType?.trim() || undefined,
					clientSecret: client.clientSecret?.trim() || undefined,
					scope: normalizedScopes,
					additionalConfig:
						client.additionalConfig && Object.keys(client.additionalConfig).length > 0
							? Object.keys(client.additionalConfig).reduce((acc, key) => {
									if (
										typeof client.additionalConfig?.[key] === "string" &&
										(client.additionalConfig[key] as string)?.trim() !== ""
									) {
										acc[key] = (client.additionalConfig[key] as string).trim();
									}
									return acc;
							  }, {} as Record<string, unknown>)
							: undefined,
				};
			});

			try {
				setIsSaving(true);
				await createOrUpdateThirdPartyProvider(tenantInfo.tenantId, normalizedProviderConfig);
				await handlePostSaveProviders("add-or-update", normalizedProviderConfig.thirdPartyId);
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

	const panelHeader = (
		<PanelHeader>
			<div className="built-in-provider-config-header">
				<div className="built-in-provider-config-header__title">
					<PanelHeaderTitleWithTooltip>
						{isSAMLProvider ? "SAML" : "Built-In Provider"} Configuration
					</PanelHeaderTitleWithTooltip>
					{!isSAMLProvider && (
						<ThirdPartyProviderButton
							title={inBuiltProviderInfo?.label ?? ""}
							icon={inBuiltProviderInfo?.icon ?? ""}
							disabled
						/>
					)}
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
	);

	if (isSAMLProvider && isAddingNewProvider && !hasAddedBoxyURLForNewSAMLProvider) {
		return (
			<PanelRoot>
				{panelHeader}
				<div className="saml-intro-container">
					<p className="saml-intro-container__header">
						You will need to setup <b>BoxyHQ</b> to add the SAML client.
					</p>

					<SAMLInfoBox title="Managed Service">
						<a href="mailto:team@supertokens.com">Email us</a> to receive your Boxy URL and continue setup
						of your SAML client.
					</SAMLInfoBox>

					<SAMLInfoBox title="Self Hosted">
						Follow the steps in the{" "}
						<a
							href="https://boxyhq.com/docs/jackson/deploy"
							rel="noreferrer noopener"
							target="_blank">
							BoxyHQ docs
						</a>{" "}
						to get your Boxy URL and continue setup of your SAML client.
					</SAMLInfoBox>

					<p className="saml-intro-container__boxy-url-header">Add the Boxy URL below</p>

					<div className="saml-intro-container__boxy-url-field-container">
						<ThirdPartyProviderInput
							label="Boxy URL"
							type="text"
							name="boxyURL"
							value={providerConfigState.clients?.[0].additionalConfig?.boxyURL as string}
							forceShowError
							error={errorState["clients.0.additionalConfig.boxyURL"]}
							handleChange={(e) => {
								setProviderConfigState((prev) => ({
									...prev,
									clients: Array.isArray(prev.clients)
										? [
												{
													...prev.clients[0],
													additionalConfig: {
														...prev.clients?.[0].additionalConfig,
														boxyURL: e.target.value,
													},
												},
										  ]
										: [],
								}));
							}}
						/>
					</div>

					<hr className="provider-config-divider" />
					<div className="built-in-provider-footer">
						<div />
						<div className="built-in-provider-footer__primary-ctas">
							<Button
								color="gray-outline"
								onClick={() => handleGoBack()}>
								Go Back
							</Button>
							<Button onClick={handleSAMLIntroContinue}>Continue</Button>
						</div>
					</div>
				</div>
			</PanelRoot>
		);
	}

	return (
		<>
			{isSAMLProvider && (
				<div className="block-info block-medium text-small tenant-detail__no-config-info-block">
					<div className="tenant-detail__no-config-info-block__no-property-pill">Info</div>
					<p>
						Follow the steps in the{" "}
						<a
							href="https://supertokens.com/docs/thirdpartyemailpassword/common-customizations/saml/with-boxyhq/integration-steps"
							target="_blank"
							rel="noreferrer noopened">
							documentation
						</a>{" "}
						to get the Client Id and Secret for your SAML provider.
					</p>
				</div>
			)}
			<PanelRoot>
				{panelHeader}
				<div className="fields-container">
					{isAddingNewProvider ? (
						<ThirdPartyProviderInput
							label="Third Party Id"
							tooltip="The Id of the provider."
							prefix={`${baseProviderId}-`}
							type="text"
							name="thirdPartyId"
							value={providerConfigState.thirdPartyId.slice(baseProviderId.length + 1)}
							forceShowError
							error={errorState.thirdPartyId}
							handleChange={handleThirdPartyIdSuffixChange}
						/>
					) : (
						<ThirdPartyProviderInput
							label="Third Party Id"
							tooltip="The Id of the provider."
							type="text"
							name="thirdPartyId"
							value={providerId}
							disabled
							handleChange={() => null}
						/>
					)}

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
						handlePostSaveProviders={handlePostSaveProviders}
					/>
				)}
			</PanelRoot>
		</>
	);
};

const SAMLInfoBox = ({ title, children }: { title: string; children: React.ReactNode }) => {
	return (
		<div className="saml-info-box-container">
			<div className="saml-info-box-container__title-container">
				<h2 className="saml-info-box-container__title">{title}</h2>
			</div>
			<div className="saml-info-box-container__content">{children}</div>
		</div>
	);
};

const getBuiltInProviderInfo = (providerId: string, providerConfig?: ProviderConfig) => {
	const customFieldProviderKey = Object.keys(IN_BUILT_PROVIDERS_CUSTOM_FIELDS).find((id) =>
		providerId.startsWith(id)
	);
	const customFields = customFieldProviderKey ? IN_BUILT_PROVIDERS_CUSTOM_FIELDS[customFieldProviderKey] : undefined;

	if (providerConfig) {
		return {
			...providerConfig,
			clients: providerConfig.clients?.map((client) => ({
				...client,
				scope: client.scope ?? customFields?.defaultScopes,
			})),
		};
	}

	const baseProviderConfig = {
		thirdPartyId: providerId,
		clients: [{ clientId: "", clientSecret: "", clientType: "", scope: [""], additionalConfig: {} }],
	};

	if (customFields === undefined) {
		return baseProviderConfig;
	}

	const additionalConfigFields = customFields.additionalConfigFields ?? [];

	if (additionalConfigFields.length > 0) {
		const additionalConfig = additionalConfigFields.reduce((acc, field) => {
			acc[field.id] = "";
			return acc;
		}, {} as Record<string, string>);

		baseProviderConfig.clients[0].additionalConfig = additionalConfig;
	}

	if (customFields.defaultScopes) {
		baseProviderConfig.clients[0].scope = customFields.defaultScopes;
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
		defaultScopes: ["openid", "email"],
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
		additionalConfigFields: [
			{
				label: "Gitlab Base URL",
				id: "gitlabBaseUrl",
				tooltip:
					"The base URL for Gitlab, The OIDC discovery endpoint for Gitlab, if you are using a self-hosted Gitlab instance.",
				type: "text",
				required: false,
			},
		],
		defaultScopes: ["openid", "email"],
	},

	"active-directory": {
		additionalConfigFields: [
			{
				label: "Directory Id",
				id: "directoryId",
				tooltip:
					"The id of the Microsoft Entra tenant, this is required if OIDC discovery endpoint is not provided.",
				type: "text",
				required: true,
			},
		],
		defaultScopes: ["openid", "email"],
	},
	bitbucket: {
		defaultScopes: ["account", "email"],
	},
	discord: {
		defaultScopes: ["identify", "email"],
	},
	facebook: {
		defaultScopes: ["email"],
	},
	github: {
		defaultScopes: ["read:user", "user:email"],
	},
	google: {
		defaultScopes: ["openid", "email"],
	},
	linkedin: {
		defaultScopes: ["openid", "profile", "email"],
	},
	okta: {
		additionalConfigFields: [
			{
				label: "Okta Domain",
				id: "oktaDomain",
				tooltip:
					"The domain of your Okta account, this is required if OIDC discovery endpoint is not provided.",
				type: "text",
				required: true,
			},
		],
		defaultScopes: ["openid", "email"],
	},
	twitter: {
		defaultScopes: ["users.read", "tweet.read"],
	},
	"boxy-saml": {
		additionalConfigFields: [
			{
				label: "Boxy URL",
				id: "boxyURL",
				tooltip: "The URL of the Boxy instance.",
				type: "text",
				required: true,
			},
		],
	},
};
