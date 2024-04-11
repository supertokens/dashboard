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
import { useCreateOrUpdateThirdPartyProvider } from "../../../../../api/tenants";
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
import { DeleteThirdPartyProviderDialog } from "../deleteThirdPartyProvider/DeleteThirdPartyProvider";
import { KeyValueInput } from "../keyValueInput/KeyValueInput";
import { useTenantDetailContext } from "../TenantDetailContext";
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
	const [isDeleteProviderDialogOpen, setIsDeleteProviderDialogOpen] = useState(false);
	const { tenantInfo, refetchTenant } = useTenantDetailContext();
	const [isSaving, setIsSaving] = useState(false);
	const { showToast } = useContext(PopupContentContext);
	const createOrUpdateThirdPartyProvider = useCreateOrUpdateThirdPartyProvider();
	const isSAMLProvider = providerId?.startsWith(SAML_PROVIDER_ID);
	const inBuiltProviderInfo = IN_BUILT_THIRD_PARTY_PROVIDERS.find((provider) => providerId?.startsWith(provider.id));
	const baseProviderId = isSAMLProvider ? SAML_PROVIDER_ID : inBuiltProviderInfo?.id ?? "";
	const shouldUsePrefixField = isAddingNewProvider && (inBuiltProviderInfo || isSAMLProvider);
	const customFieldProviderKey = Object.keys(IN_BUILT_PROVIDERS_CUSTOM_FIELDS).find((id) =>
		providerId?.startsWith(id)
	);
	const customFields = customFieldProviderKey ? IN_BUILT_PROVIDERS_CUSTOM_FIELDS[customFieldProviderKey] : undefined;

	const handleAddNewClient = () => {
		let additionalConfigFields: Array<[string, string]> = [["", ""]];

		if (customFields) {
			additionalConfigFields = customFields.map((field) => [field.id, ""]);
		}

		setProviderConfigState((prev) => ({
			...prev,
			clients: [
				...(prev?.clients ?? []),
				{
					clientId: "",
					clientSecret: "",
					clientType: "",
					scope: [""],
					additionalConfig: additionalConfigFields,
					forcePKCE: false,
					key: crypto.randomUUID(),
				},
			],
		}));
	};

	const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
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

	const handleSave = async () => {
		setErrorState({});
		const clientTypes = new Set<string>();
		const isAppleProvider = providerId?.startsWith("apple");
		let isValid = true;
		const doesThirdPartyIdExist = tenantInfo.thirdParty.providers.some(
			(pid) => pid === providerConfigState.thirdPartyId
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
			setErrorState((prev) => ({ ...prev, thirdPartyId: "Third Party Id already exists" }));
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
				<div className="built-in-provider-config-header">
					<div className="built-in-provider-config-header__title">
						<PanelHeaderTitleWithTooltip>Provider Configuration</PanelHeaderTitleWithTooltip>
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

				<UserInfoMap
					label="User Info Map from UserInfo API"
					tooltip="The mapping of the user info fields to the user info API."
					name="fromUserInfoAPI"
					isOverridden={providerConfig?.isGetUserInfoOverridden}
					hasEmailOverrides
					value={
						providerConfigState.userInfoMap.fromUserInfoAPI ?? { userId: "", email: "", emailVerified: "" }
					}
					handleChange={handleUserInfoFieldChange}
					requireEmail={providerConfigState.requireEmail}
					handleRequireEmailChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, requireEmail: value }));
					}}
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

const UserInfoMap = ({
	label,
	tooltip,
	name,
	value,
	handleChange,
	isOverridden,
	hasEmailOverrides,
	requireEmail,
	handleRequireEmailChange,
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
	hasEmailOverrides?: boolean;
	requireEmail?: boolean;
	handleRequireEmailChange?: (value: boolean) => void;
}) => {
	const [emailSelectValue, setEmailSelectValue] = useState<EmailSelectState>(() => {
		if (requireEmail === false) {
			return "never";
		}
		return "always";
	});

	const handleEmailSelectChange = (value: EmailSelectState) => {
		setEmailSelectValue(value);
		if (value === "never" && handleRequireEmailChange) {
			handleRequireEmailChange(false);
		} else if (value === "always" && handleRequireEmailChange) {
			handleRequireEmailChange(true);
		}
	};

	const isEmailFieldVisible = isOverridden || !hasEmailOverrides || emailSelectValue === "always";

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
				{!isOverridden && hasEmailOverrides && (
					<div className="provider-email-select">
						<ThirdPartyProviderInputLabel label="How often does the provider return email?" />
						<EmailSelect
							value={emailSelectValue}
							setValue={handleEmailSelectChange}
						/>
					</div>
				)}
				{(emailSelectValue === "sometimes" || emailSelectValue === "never") && (
					<div className="overridden-info">
						<b>Note:</b>{" "}
						{emailSelectValue === "never"
							? "We will generate a fake email for the end users automatically using their user id. If you want override how the fake email is generated by the SDK you can do so by overriding the generateFakeEmail method in the provider config"
							: "Add a custom override for the getUserInfo method for this provider to handle the case when provider doesn't return email."}
					</div>
				)}
				{isEmailFieldVisible && (
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
				)}
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

const EmailSelectValues: Array<{ label: string; value: EmailSelectState }> = [
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
	tokenEndpointBodyParams: Array<[string, string | null]>;
	authorizationEndpointQueryParams: Array<[string, string | null]>;
	userInfoEndpointHeaders: Array<[string, string | null]>;
	userInfoEndpointQueryParams: Array<[string, string | null]>;
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

	const additionaConfigFields: Array<[string, string]> = customFields.map((field) => [field.id, ""]);
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
			type: "text",
			required: true,
		},
	],
};
