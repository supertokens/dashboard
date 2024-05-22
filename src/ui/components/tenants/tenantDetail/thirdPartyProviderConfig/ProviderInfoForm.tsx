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
import { useCreateOrUpdateThirdPartyProviderService } from "../../../../../api/tenants";
import {
	BuiltInProvidersCustomFields,
	ProviderClientState,
	ProviderConfig,
	ProviderConfigResponse,
} from "../../../../../api/tenants/types";
import { IN_BUILT_THIRD_PARTY_PROVIDERS, SAML_PROVIDER_ID } from "../../../../../constants";
import { getImageUrl, isValidHttpUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { Toggle } from "../../../toggle/Toggle";
import TooltipContainer from "../../../tooltip/tooltip";
import { useTenantDetailContext } from "../TenantDetailContext";
import { DeleteThirdPartyProviderDialog } from "../deleteThirdPartyProvider/DeleteThirdPartyProvider";
import { KeyValueInput } from "../keyValueInput/KeyValueInput";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import { ThirdPartyProviderButton } from "../thirdPartyProviderButton/ThirdPartyProviderButton";
import {
	ThirdPartyProviderInput,
	ThirdPartyProviderInputLabel,
} from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import { ClientConfig } from "./ClientConfig";
import "./thirdPartyProviderConfig.scss";

export const ProviderInfoForm = ({
	providerId,
	providerConfig,
	handleGoBack,
	isAddingNewProvider,
}: {
	providerId?: string;
	isAddingNewProvider: boolean;
	handleGoBack: (shouldGoBackToDetailPage?: boolean) => void;
	providerConfig?: ProviderConfigResponse;
}) => {
	const [providerConfigState, setProviderConfigState] = useState(getInitialProviderInfo(providerConfig, providerId));
	const [errorState, setErrorState] = useState<Record<string, string>>({});
	const [isSuffixFieldVisible, setIsSuffixFieldVisible] = useState(false);
	const [emailSelectValue, setEmailSelectValue] = useState<EmailSelectState>(() => {
		if (providerConfig?.requireEmail === false) {
			return "sometimes";
		}
		return "always";
	});
	const [isDeleteProviderDialogOpen, setIsDeleteProviderDialogOpen] = useState(false);
	const { tenantInfo, refetchTenant } = useTenantDetailContext();
	const [isSaving, setIsSaving] = useState(false);
	const { showToast } = useContext(PopupContentContext);
	const createOrUpdateThirdPartyProvider = useCreateOrUpdateThirdPartyProviderService();
	const isSAMLProvider = providerId?.startsWith(SAML_PROVIDER_ID);
	const inBuiltProviderInfo = IN_BUILT_THIRD_PARTY_PROVIDERS.find((provider) => providerId?.startsWith(provider.id));
	const baseProviderId = isSAMLProvider ? SAML_PROVIDER_ID : inBuiltProviderInfo?.id ?? "";
	const shouldUsePrefixField = isAddingNewProvider && (inBuiltProviderInfo || isSAMLProvider);
	const customFieldProviderKey = Object.keys(IN_BUILT_PROVIDERS_CUSTOM_FIELDS).find((id) =>
		providerId?.startsWith(id)
	);
	const customFields = customFieldProviderKey ? IN_BUILT_PROVIDERS_CUSTOM_FIELDS[customFieldProviderKey] : undefined;
	const formHasError = Object.values(errorState).some((error) => error !== "");

	const handleAddNewClient = () => {
		setProviderConfigState((prev) => {
			const commonFields: Pick<ProviderClientState, "additionalConfig" | "forcePKCE" | "scope"> = {
				scope: [""],
				additionalConfig: [["", ""]],
				forcePKCE: false,
			};
			// Copy over the scope, additionalConfig and forcePKCE from the first client
			if (prev.clients[0]) {
				const { scope, additionalConfig, forcePKCE } = prev.clients[0];
				commonFields.scope = Array.isArray(scope) ? [...scope] : [""];
				commonFields.additionalConfig = Array.isArray(additionalConfig) ? [...additionalConfig] : [["", ""]];
				commonFields.forcePKCE = forcePKCE;
			}

			// If there are any custom additional config like in case of apple
			// we don't copy those fields instead we set them to empty string
			if (customFields) {
				commonFields.additionalConfig = customFields.map((field) => [field.id, ""]);
			}

			return {
				...prev,
				clients: [
					...(prev?.clients ?? []),
					{
						clientId: "",
						clientSecret: "",
						clientType: "",
						...commonFields,
						key: crypto.randomUUID(),
					},
				],
			};
		});
	};

	const handleFieldChange = (e: ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
		if (e.type === "change") {
			setProviderConfigState({ ...providerConfigState, [e.target.name]: e.target.value });
		}
	};

	const handleUserInfoFieldChange = ({
		name,
		key,
		value,
	}: {
		name: "fromIdTokenPayload" | "fromUserInfoAPI";
		key: string;
		value: string;
	}) => {
		setProviderConfigState((prev) => ({
			...prev,
			userInfoMap: {
				...prev.userInfoMap,
				[name]: {
					...prev.userInfoMap[name],
					[key]: value,
				},
			},
		}));
	};

	const handleEmailSelectChange = (value: EmailSelectState) => {
		setEmailSelectValue(value);
		if (value === "never") {
			setProviderConfigState((prev) => ({ ...prev, requireEmail: false }));
		} else {
			setProviderConfigState((prev) => ({ ...prev, requireEmail: true }));
		}
	};

	const handleThirdPartyIdSuffixChange = (
		e: ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
	) => {
		if (e.type !== "change") {
			return;
		}

		if (e.target.value.trim() === "") {
			setProviderConfigState((prev) => ({ ...prev, thirdPartyId: baseProviderId }));
		} else {
			setProviderConfigState((prev) => ({
				...prev,
				thirdPartyId: `${baseProviderId}${e.target.value.trim()}`,
			}));
		}
	};

	const showSuffixField = () => {
		setIsSuffixFieldVisible(true);
		setProviderConfigState((prev) => ({
			...prev,
			thirdPartyId: `${baseProviderId}-`,
		}));
		setErrorState((prev) => {
			const { thirdPartyId: _, ...rest } = prev;
			return rest;
		});
	};

	const handleSave = async () => {
		setErrorState({});
		const clientTypes = new Set<string>();
		const isAppleProvider = providerId?.startsWith("apple");
		let isValid = true;
		const doesThirdPartyIdExist = tenantInfo.thirdParty.providers.some(
			(provider) => provider.thirdPartyId === providerConfigState.thirdPartyId
		);

		if (typeof providerConfigState.thirdPartyId !== "string" || providerConfigState.thirdPartyId.trim() === "") {
			setErrorState((prev) => ({ ...prev, thirdPartyId: "Third Party Id is required" }));
			isValid = false;
		} else if (!providerConfigState.thirdPartyId.match(/^[a-z0-9-]+$/)) {
			setErrorState((prev) => ({
				...prev,
				thirdPartyId: "Third Party Id can only contain lowercase alphabets, numbers and hyphens",
			}));
			isValid = false;
		} else if (doesThirdPartyIdExist && isAddingNewProvider) {
			setErrorState((prev) => ({
				...prev,
				thirdPartyId:
					"Another provider with this third party id already exists, please enter a unique third party id or a unique suffix if adding a built-in provider.",
			}));
			isValid = false;
		}

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

		if (customFields) {
			providerConfigState.clients?.forEach((client, index) => {
				customFields?.forEach((field) => {
					const fieldValue = client.additionalConfig.find(([key]) => key === field.id)?.[1];
					if (field.required && (typeof fieldValue !== "string" || fieldValue.trim() === "")) {
						setErrorState((prev) => ({
							...prev,
							[`clients.${index}.additionalConfig.${field.id}`]: `${field.label} is required`,
						}));
						isValid = false;
					}
				});
			});
		}

		if (
			(providerConfigState.oidcDiscoveryEndpoint?.trim().length ?? 0) > 0 &&
			!isValidHttpUrl(providerConfigState.oidcDiscoveryEndpoint)
		) {
			setErrorState((prev) => ({
				...prev,
				oidcDiscoveryEndpoint: "OIDC Discovery Endpoint should be a valid URL",
			}));
			isValid = false;
		}

		if (
			(providerConfigState.tokenEndpoint?.trim().length ?? 0) > 0 &&
			!isValidHttpUrl(providerConfigState.tokenEndpoint)
		) {
			setErrorState((prev) => ({
				...prev,
				tokenEndpoint: "Token Endpoint should be a valid URL",
			}));

			isValid = false;
		}

		if (
			(providerConfigState.authorizationEndpoint?.trim().length ?? 0) > 0 &&
			!isValidHttpUrl(providerConfigState.authorizationEndpoint)
		) {
			setErrorState((prev) => ({
				...prev,
				authorizationEndpoint: "Authorization Endpoint should be a valid URL",
			}));
			isValid = false;
		}

		if (
			(providerConfigState.userInfoEndpoint?.trim().length ?? 0) > 0 &&
			!isValidHttpUrl(providerConfigState.userInfoEndpoint)
		) {
			setErrorState((prev) => ({
				...prev,
				userInfoEndpoint: "User Info Endpoint should be a valid URL",
			}));
			isValid = false;
		}

		if ((providerConfigState.jwksURI?.trim().length ?? 0) > 0 && !isValidHttpUrl(providerConfigState.jwksURI)) {
			setErrorState((prev) => ({
				...prev,
				jwksURI: "JWKS URI should be a valid URL",
			}));
			isValid = false;
		}

		if (!isValid) {
			return;
		}

		const normalizedProviderConfigClients = providerConfigState.clients?.map((client) => {
			const normalizedScopes = client.scope?.filter((scope) => scope && scope?.trim() !== "") ?? [];
			return {
				clientId: client.clientId.trim(),
				clientType: client.clientType?.trim(),
				clientSecret: client.clientSecret?.trim(),
				scope: normalizedScopes,
				additionalConfig: Object.fromEntries(
					client.additionalConfig.filter(([key, _]: [string, string | null]) => key.trim().length > 0)
				),
				forcePKCE: client.forcePKCE,
			};
		});

		const normalizedAuthorizationEndpointQueryParams = Object.fromEntries(
			providerConfigState.authorizationEndpointQueryParams.filter(
				([key, _]: [string, string | null]) => typeof key === "string" && key.trim().length > 0
			)
		);

		const normalizedTokenEndpointBodyParams = Object.fromEntries(
			providerConfigState.tokenEndpointBodyParams.filter(
				([key, _]: [string, string | null]) => typeof key === "string" && key.trim().length > 0
			)
		);

		const normalizedUserInfoEndpointQueryParams = Object.fromEntries(
			providerConfigState.userInfoEndpointQueryParams.filter(
				([key, _]: [string, string | null]) => typeof key === "string" && key.trim().length > 0
			)
		);

		const normalizedUserInfoEndpointHeaders = Object.fromEntries(
			providerConfigState.userInfoEndpointHeaders.filter(
				([key, _]: [string, string | null]) => typeof key === "string" && key.trim().length > 0
			)
		);

		const normalizedProviderConfig = {
			thirdPartyId: providerConfigState.thirdPartyId,
			name: providerConfigState.name.trim(),
			oidcDiscoveryEndpoint: providerConfigState.oidcDiscoveryEndpoint.trim() || null,
			tokenEndpoint: providerConfigState.tokenEndpoint.trim() || null,
			userInfoEndpoint: providerConfigState.userInfoEndpoint.trim() || null,
			authorizationEndpoint: providerConfigState.authorizationEndpoint.trim() || null,
			jwksURI: providerConfigState.jwksURI.trim() || null,
			requireEmail: providerConfigState.requireEmail,
			clients: normalizedProviderConfigClients,
			userInfoMap: {
				fromIdTokenPayload: {
					userId: providerConfigState.userInfoMap.fromIdTokenPayload?.userId?.trim() || null,
					email: providerConfigState.userInfoMap.fromIdTokenPayload?.email?.trim() || null,
					emailVerified: providerConfigState.userInfoMap.fromIdTokenPayload?.emailVerified?.trim() || null,
				},
				fromUserInfoAPI: {
					userId: providerConfigState.userInfoMap.fromUserInfoAPI?.userId?.trim() || null,
					email: providerConfigState.userInfoMap.fromUserInfoAPI?.email?.trim() || null,
					emailVerified: providerConfigState.userInfoMap.fromUserInfoAPI?.emailVerified?.trim() || null,
				},
			},
			authorizationEndpointQueryParams: normalizedAuthorizationEndpointQueryParams,
			tokenEndpointBodyParams: normalizedTokenEndpointBodyParams,
			userInfoEndpointQueryParams: normalizedUserInfoEndpointQueryParams,
			userInfoEndpointHeaders: normalizedUserInfoEndpointHeaders,
		};

		try {
			setIsSaving(true);
			await createOrUpdateThirdPartyProvider(tenantInfo.tenantId, normalizedProviderConfig as ProviderConfig);
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
			window.scrollTo(0, 0);
		}
	};

	return (
		<PanelRoot>
			<PanelHeader>
				<div className="custom-provider-config-header">
					<div className="custom-provider-config-header__title">
						<PanelHeaderTitleWithTooltip>
							{isAddingNewProvider ? "Configure new provider" : "Provider Configuration"}
						</PanelHeaderTitleWithTooltip>
						{inBuiltProviderInfo && (
							<ThirdPartyProviderButton
								title={inBuiltProviderInfo?.label}
								icon={inBuiltProviderInfo?.icon}
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
			<div className="fields-container">
				{shouldUsePrefixField ? (
					isSuffixFieldVisible ? (
						<ThirdPartyProviderInput
							label="Third Party Id"
							tooltip="The Id of the provider."
							prefix={`${baseProviderId}`}
							type="text"
							name="thirdPartyId"
							value={providerConfigState.thirdPartyId.slice(baseProviderId.length)}
							forceShowError
							error={errorState.thirdPartyId}
							handleChange={handleThirdPartyIdSuffixChange}
						/>
					) : (
						<div className="suffix-preview-field">
							<ThirdPartyProviderInputLabel
								label="Third Party Id"
								tooltip="The Id of the provider."
								minLabelWidth={120}
							/>
							<div className="suffix-preview-container">
								<div className="suffix-preview-container__suffix">
									<span className="prefix-preview">{baseProviderId}</span>
									<div className="suffix-button-container">
										<button onClick={showSuffixField}>+ Add suffix</button>
										<TooltipContainer tooltip="You can add multiple providers of the same type by adding a unique suffix to the third party id.">
											<span className="suffix-button-container__help-icon">
												<img
													src={getImageUrl("help-circle.svg")}
													alt="help"
												/>
											</span>
										</TooltipContainer>
									</div>
								</div>
								{errorState.thirdPartyId && (
									<div className="suffix-preview-container__error">{errorState.thirdPartyId}</div>
								)}
							</div>
						</div>
					)
				) : (
					<ThirdPartyProviderInput
						label="Third Party Id"
						tooltip="The Id of the provider."
						type="text"
						name="thirdPartyId"
						value={providerConfigState.thirdPartyId}
						disabled={!isAddingNewProvider}
						error={errorState.thirdPartyId}
						forceShowError
						isRequired
						handleChange={handleFieldChange}
						minLabelWidth={120}
					/>
				)}
				<ThirdPartyProviderInput
					label="Name"
					tooltip="The name of the provider."
					type="text"
					name="name"
					error={errorState.name}
					forceShowError
					value={providerConfigState.name}
					minLabelWidth={120}
					handleChange={handleFieldChange}
				/>
				<div className="custom-provider-divider" />
				<div className="custom-provider-client-config">
					<div className="custom-provider-client-config__header">Clients</div>
					{providerConfigState.clients?.map((client, index) => (
						<ClientConfig
							key={client.key}
							providerId={providerConfigState.thirdPartyId}
							clientsCount={providerConfigState.clients?.length ?? 0}
							client={client}
							clientIndex={index}
							errors={errorState}
							additionalConfigFields={customFields}
							setClient={(client: ProviderClientState) => {
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
					label="OIDC Discovery Endpoint"
					tooltip="The OIDC discovery endpoint of the provider."
					type="text"
					error={errorState.oidcDiscoveryEndpoint}
					forceShowError
					name="oidcDiscoveryEndpoint"
					value={providerConfigState.oidcDiscoveryEndpoint}
					handleChange={handleFieldChange}
				/>
				<div className="custom-provider-divider" />
				<ThirdPartyProviderInput
					label="Authorization Endpoint"
					tooltip="The authorization endpoint of the provider."
					type="text"
					disabled={providerConfig?.isGetAuthorisationRedirectUrlOverridden}
					error={errorState.authorizationEndpoint}
					forceShowError
					name="authorizationEndpoint"
					value={
						providerConfig?.isGetAuthorisationRedirectUrlOverridden
							? "Custom Override"
							: providerConfigState.authorizationEndpoint
					}
					handleChange={handleFieldChange}
				/>
				<KeyValueInput
					label="Authorization Endpoint Query Params"
					name="authorizationEndpointQueryParams"
					tooltip="The query params to be sent to the authorization endpoint."
					value={providerConfigState.authorizationEndpointQueryParams}
					isOverridden={providerConfig?.isGetAuthorisationRedirectUrlOverridden}
					onChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, authorizationEndpointQueryParams: value }));
					}}
				/>

				{providerConfig?.isGetAuthorisationRedirectUrlOverridden && (
					<div className="overridden-info">
						<b>Note:</b> You cannot edit the above fields because this provider is using a custom override
						for <code>getAuthorisationRedirectUrl</code>
					</div>
				)}

				<div className="custom-provider-divider" />
				<ThirdPartyProviderInput
					label="Token Endpoint"
					tooltip="The token endpoint of the provider."
					type="text"
					disabled={providerConfig?.isExchangeAuthCodeForOAuthTokensOverridden}
					name="tokenEndpoint"
					error={errorState.tokenEndpoint}
					forceShowError
					value={
						providerConfig?.isExchangeAuthCodeForOAuthTokensOverridden
							? "Custom Override"
							: providerConfigState.tokenEndpoint
					}
					handleChange={handleFieldChange}
				/>
				<KeyValueInput
					label="Token Endpoint Body Params"
					name="tokenEndpointBodyParams"
					tooltip="The body params to be sent to the token endpoint."
					isOverridden={providerConfig?.isExchangeAuthCodeForOAuthTokensOverridden}
					value={providerConfigState.tokenEndpointBodyParams}
					onChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, tokenEndpointBodyParams: value }));
					}}
				/>

				{providerConfig?.isExchangeAuthCodeForOAuthTokensOverridden && (
					<div className="overridden-info">
						<b>Note:</b> You cannot edit the above fields because this provider is using a custom override
						for <code>exchangeAuthCodeForOAuthTokens</code>
					</div>
				)}

				<div className="custom-provider-divider" />

				<ThirdPartyProviderInput
					label="User Info Endpoint"
					tooltip="The user info endpoint of the provider."
					type="text"
					name="userInfoEndpoint"
					disabled={providerConfig?.isGetUserInfoOverridden}
					error={errorState.userInfoEndpoint}
					forceShowError
					value={
						providerConfig?.isGetUserInfoOverridden
							? "Custom Override"
							: providerConfigState.userInfoEndpoint
					}
					handleChange={handleFieldChange}
				/>

				<KeyValueInput
					label="User Info Endpoint Query Params"
					name="userInfoEndpointQueryParams"
					tooltip="The query params to be sent to the user info endpoint."
					value={providerConfigState.userInfoEndpointQueryParams}
					isOverridden={providerConfig?.isGetUserInfoOverridden}
					onChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, userInfoEndpointQueryParams: value }));
					}}
				/>

				<KeyValueInput
					label="User Info Endpoint Headers"
					name="userInfoEndpointHeaders"
					tooltip="The headers to be sent to the user info endpoint."
					value={providerConfigState.userInfoEndpointHeaders}
					isOverridden={providerConfig?.isGetUserInfoOverridden}
					onChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, userInfoEndpointHeaders: value }));
					}}
				/>

				<div className="provider-email-select">
					<ThirdPartyProviderInputLabel label="How often does the provider return email?" />
					<EmailSelect
						value={emailSelectValue}
						setValue={handleEmailSelectChange}
					/>
				</div>

				{emailSelectValue === "never" && (
					<div className="overridden-info">
						<b>Note:</b> We will generate a fake email for the end users automatically using their user id.
					</div>
				)}

				{emailSelectValue === "sometimes" && (
					<div className="fields-container__toggle-container">
						<ThirdPartyProviderInputLabel label="Do you want to generate a fake email when the provider doesn't return an email?" />
						<Toggle
							id="requireEmail"
							checked={!providerConfigState.requireEmail}
							onChange={(e) => {
								setProviderConfigState((prev) => ({ ...prev, requireEmail: !e.target.checked }));
							}}
						/>
					</div>
				)}

				<UserInfoMap
					label="User Info Map from UserInfo API"
					tooltip="The mapping of the user info fields to the user info API."
					name="fromUserInfoAPI"
					isOverridden={providerConfig?.isGetUserInfoOverridden}
					value={
						providerConfigState.userInfoMap.fromUserInfoAPI ?? { userId: "", email: "", emailVerified: "" }
					}
					handleChange={handleUserInfoFieldChange}
				/>

				<UserInfoMap
					label="User Info Map from Id Token Payload"
					tooltip="The mapping of the user info fields to the id token payload."
					name="fromIdTokenPayload"
					isOverridden={providerConfig?.isGetUserInfoOverridden}
					value={
						providerConfigState.userInfoMap.fromIdTokenPayload ?? {
							userId: "",
							email: "",
							emailVerified: "",
						}
					}
					handleChange={handleUserInfoFieldChange}
				/>

				{providerConfig?.isGetUserInfoOverridden && (
					<div className="overridden-info">
						<b>Note:</b> You cannot edit the above fields because this provider is using a custom override
						for <code>getUserInfo</code>
					</div>
				)}

				<div className="custom-provider-divider" />

				<ThirdPartyProviderInput
					label="JWKS URI"
					tooltip="The JWKS URI of the provider."
					type="text"
					name="jwksURI"
					error={errorState.jwksURI}
					forceShowError
					value={providerConfigState.jwksURI}
					handleChange={handleFieldChange}
				/>
			</div>
			<hr className="provider-config-divider" />
			<div className={`custom-provider-footer ${formHasError ? "custom-provider-footer--error" : ""}`}>
				{formHasError && (
					<div className="custom-provider-footer__form-error block-small block-error">
						<img
							className="custom-provider-footer__form-error-icon"
							src={getImageUrl("form-field-error-icon.svg")}
							alt="Error in field"
						/>
						<p className="text-small text-error">
							Please ensure all fields are correctly filled out before saving.
						</p>
					</div>
				)}

				<div className="custom-provider-footer__primary-ctas">
					<Button
						color="gray-outline"
						onClick={() => {
							window.scrollTo(0, 0);
							handleGoBack();
						}}>
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

const UserInfoMap = ({
	label,
	tooltip,
	name,
	value,
	handleChange,
	isOverridden,
}: {
	label: string;
	tooltip: string;
	name: "fromIdTokenPayload" | "fromUserInfoAPI";
	value: {
		userId?: string;
		email?: string;
		emailVerified?: string;
	};
	handleChange: ({
		name,
		key,
		value,
	}: {
		name: "fromIdTokenPayload" | "fromUserInfoAPI";
		key: string;
		value: string;
	}) => void;
	isOverridden?: boolean;
}) => {
	return (
		<div className="user-info-map">
			<ThirdPartyProviderInputLabel
				label={label}
				tooltip={tooltip}
			/>
			<div className="user-info-map__fields-container">
				<ThirdPartyProviderInput
					label="userId"
					type="text"
					name={`userId-${name}`}
					minLabelWidth={130}
					disabled={isOverridden}
					value={isOverridden ? "Custom Override" : value.userId}
					handleChange={(e) =>
						handleChange({
							name,
							key: "userId",
							value: e.target.value,
						})
					}
				/>

				<ThirdPartyProviderInput
					label="email"
					type="text"
					name={`email-${name}`}
					disabled={isOverridden}
					minLabelWidth={130}
					value={isOverridden ? "Custom Override" : value.email}
					handleChange={(e) =>
						handleChange({
							name,
							key: "email",
							value: e.target.value,
						})
					}
				/>

				<ThirdPartyProviderInput
					label="emailVerified"
					type="text"
					name="emailVerified"
					disabled={isOverridden}
					minLabelWidth={130}
					value={isOverridden ? "Custom Override" : value.emailVerified}
					handleChange={(e) =>
						handleChange({
							name,
							key: "emailVerified",
							value: e.target.value,
						})
					}
				/>
			</div>
		</div>
	);
};

type EmailSelectState = "always" | "sometimes" | "never";

const EmailSelectValues: { label: string; value: EmailSelectState }[] = [
	{
		label: "All the time",
		value: "always",
	},
	{
		label: "Sometimes",
		value: "sometimes",
	},
	{
		label: "Never",
		value: "never",
	},
];

const EmailSelect = ({ value, setValue }: { value: EmailSelectState; setValue: (value: EmailSelectState) => void }) => {
	return (
		<div className="email-select-container">
			{EmailSelectValues.map((option) => (
				<button
					key={option.value}
					className={`email-select-option ${value === option.value ? "email-select-option--selected" : ""}`}
					onClick={() => setValue(option.value)}>
					{option.label}
				</button>
			))}
		</div>
	);
};

type ProviderConfigState = Omit<
	Required<ProviderConfig>,
	| "tokenEndpointBodyParams"
	| "authorizationEndpointQueryParams"
	| "userInfoEndpointHeaders"
	| "userInfoEndpointQueryParams"
	| "clients"
> & {
	tokenEndpointBodyParams: [string, string | null][];
	authorizationEndpointQueryParams: [string, string | null][];
	userInfoEndpointHeaders: [string, string | null][];
	userInfoEndpointQueryParams: [string, string | null][];
	clients: ProviderClientState[];
};

const getInitialProviderInfo = (
	providerConfig: ProviderConfig | undefined,
	providerId?: string
): ProviderConfigState => {
	const customFieldProviderKey = Object.keys(IN_BUILT_PROVIDERS_CUSTOM_FIELDS).find((id) =>
		providerId?.startsWith(id)
	);
	const customFields = customFieldProviderKey ? IN_BUILT_PROVIDERS_CUSTOM_FIELDS[customFieldProviderKey] : [];

	let additionaConfigFields: [string, string][] = customFields.map((field) => [field.id, ""]);

	if (additionaConfigFields.length === 0) {
		additionaConfigFields = [["", ""]];
	}

	if (providerConfig !== undefined) {
		return {
			...providerConfig,
			name: providerConfig.name ?? "",
			authorizationEndpoint: providerConfig.authorizationEndpoint ?? "",
			tokenEndpoint: providerConfig.tokenEndpoint ?? "",
			userInfoEndpoint: providerConfig.userInfoEndpoint ?? "",
			jwksURI: providerConfig.jwksURI ?? "",
			oidcDiscoveryEndpoint: providerConfig.oidcDiscoveryEndpoint ?? "",
			requireEmail: providerConfig.requireEmail ?? true,
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
			clients:
				Array.isArray(providerConfig.clients) && providerConfig.clients.length > 0
					? providerConfig.clients.map((client) => ({
							...client,
							additionalConfig:
								client.additionalConfig && Object.keys(client.additionalConfig).length > 0
									? Object.entries(client.additionalConfig)
									: [["", ""]],
							key: crypto.randomUUID(),
					  }))
					: [
							{
								clientId: "",
								clientSecret: "",
								clientType: "",
								scope: [""],
								additionalConfig: additionaConfigFields,
								forcePKCE: false,
								key: crypto.randomUUID(),
							},
					  ],
			tokenEndpointBodyParams:
				providerConfig.tokenEndpointBodyParams && Object.keys(providerConfig.tokenEndpointBodyParams).length > 0
					? Object.entries(providerConfig.tokenEndpointBodyParams)
					: [["", ""]],
			authorizationEndpointQueryParams:
				providerConfig.authorizationEndpointQueryParams &&
				Object.keys(providerConfig.authorizationEndpointQueryParams).length > 0
					? Object.entries(providerConfig.authorizationEndpointQueryParams)
					: [["", ""]],
			userInfoEndpointQueryParams:
				providerConfig.userInfoEndpointQueryParams &&
				Object.keys(providerConfig.userInfoEndpointQueryParams).length > 0
					? Object.entries(providerConfig.userInfoEndpointQueryParams)
					: [["", ""]],
			userInfoEndpointHeaders:
				providerConfig.userInfoEndpointHeaders && Object.keys(providerConfig.userInfoEndpointHeaders).length > 0
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
		requireEmail: true,
		clients: [
			{
				clientId: "",
				clientSecret: "",
				clientType: "",
				scope: [""],
				additionalConfig: additionaConfigFields,
				forcePKCE: false,
				key: crypto.randomUUID(),
			},
		],
	};
};
const IN_BUILT_PROVIDERS_CUSTOM_FIELDS: BuiltInProvidersCustomFields = {
	apple: [
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
			type: "multiline",
			required: true,
		},
	],
};
