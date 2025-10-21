/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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

import { useEffect, useState } from "react";
import { Badge, Flex, Switch, Text } from "@radix-ui/themes";
import { Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";
import ItemLabel from "@shared/components/itemLabel";
import Loader from "@shared/components/loader";
import { useToast } from "@shared/components/toast";
import { getImageUrl } from "@shared/utils/index";
import { IN_BUILT_THIRD_PARTY_PROVIDERS, SAML_PROVIDER_ID } from "@shared/constants";
import { useGetThirdPartyProviderInfoService, useCreateOrUpdateThirdPartyProviderService } from "@api/tenants";
import type { ProviderConfigResponse } from "@api/tenants/types";
import { useTenantDetails } from "@features/tenants/hooks/useTenantDetails";
import DeleteProviderConfigModal from "@features/tenants/modals/DeleteProviderConfigModal";
import { IN_BUILT_PROVIDERS_CUSTOM_FIELDS_FOR_CLIENT, SAML_NAME_OPTIONS } from "@features/tenants/constants/providers";

import {
	getInitialProviderState,
	isKnownThirdPartyId,
	normalizeProviderConfig,
	type ProviderConfigState,
} from "./providerConfigHelpers";
import { validateProviderConfig } from "./providerConfigValidation";
import {
	ClientConfigSection,
	EmailSelect,
	type EmailSelectState,
	ProviderConfigInputLabel,
	ProviderConfigInputRow,
	ProviderConfigKeyValue,
	ProviderConfigSeparator,
	ProviderConfigSuffixInput,
	UserInfoMapSection,
} from "./components";
import styles from "./ProviderConfiguration.module.scss";

interface ProviderConfigurationProps {
	tenantId: string;
	providerId: string;
	isAddingNewProvider: boolean;
	onDelete?: () => void;
	onSave?: () => void;
	onCancel?: () => void;
	providerConfigResponse?: ProviderConfigResponse;
	additionalConfig?: Record<string, string>;
}

export const ProviderConfiguration = ({
	tenantId,
	providerId,
	isAddingNewProvider,
	onDelete,
	onSave,
	onCancel,
	providerConfigResponse: initialProviderConfigResponse,
	additionalConfig,
}: ProviderConfigurationProps) => {
	const [isLoading, setIsLoading] = useState(!initialProviderConfigResponse);
	const [isEditing, setIsEditing] = useState(isAddingNewProvider);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [providerConfigResponse, setProviderConfigResponse] = useState<ProviderConfigResponse | undefined>(
		initialProviderConfigResponse
	);
	const [providerConfigState, setProviderConfigState] = useState<ProviderConfigState | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [emailSelectValue, setEmailSelectValue] = useState<EmailSelectState>("always");
	const [isSuffixFieldVisible, setIsSuffixFieldVisible] = useState(false);

	const getThirdPartyProviderInfo = useGetThirdPartyProviderInfoService();
	const createOrUpdateThirdPartyProvider = useCreateOrUpdateThirdPartyProviderService();
	const { tenantInfo, refetch } = useTenantDetails(tenantId);
	const { showSuccessToast, showErrorToast } = useToast();

	const isSAMLProvider = providerId?.startsWith(SAML_PROVIDER_ID);
	const inBuiltProviderInfo = IN_BUILT_THIRD_PARTY_PROVIDERS.find((provider) => providerId?.startsWith(provider.id));
	const baseProviderId = isSAMLProvider ? SAML_PROVIDER_ID : inBuiltProviderInfo?.id ?? "";
	const shouldUseSuffixField = isAddingNewProvider && (Boolean(inBuiltProviderInfo) || isSAMLProvider);

	const customFieldProviderKey = Object.keys(IN_BUILT_PROVIDERS_CUSTOM_FIELDS_FOR_CLIENT).find((id) =>
		providerId?.startsWith(id)
	);
	const customFields = customFieldProviderKey
		? IN_BUILT_PROVIDERS_CUSTOM_FIELDS_FOR_CLIENT[customFieldProviderKey]
		: undefined;

	useEffect(() => {
		// If we already have provider config response (passed from parent), use it
		if (initialProviderConfigResponse) {
			const initialState = getInitialProviderState(initialProviderConfigResponse, providerId);
			setProviderConfigState(initialState);

			// Set email select value
			if (initialProviderConfigResponse.requireEmail === false) {
				setEmailSelectValue("sometimes");
			} else {
				setEmailSelectValue("always");
			}
			setIsLoading(false);
			return;
		}

		// Otherwise fetch provider info
		const fetchProviderInfo = async () => {
			try {
				setIsLoading(true);
				const response = await getThirdPartyProviderInfo(tenantId, providerId, additionalConfig);
				if (response.status === "OK") {
					setProviderConfigResponse(response.providerConfig);
					const initialState = getInitialProviderState(response.providerConfig, providerId);
					setProviderConfigState(initialState);

					// Set email select value
					if (response.providerConfig.requireEmail === false) {
						setEmailSelectValue("sometimes");
					} else {
						setEmailSelectValue("always");
					}
				}
			} catch (error) {
				showErrorToast("Error", "Failed to fetch provider configuration");
			} finally {
				setIsLoading(false);
			}
		};

		if (!isAddingNewProvider) {
			void fetchProviderInfo();
		} else {
			const initialState = getInitialProviderState(undefined, providerId);
			setProviderConfigState(initialState);
			setIsLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tenantId, providerId, isAddingNewProvider, initialProviderConfigResponse]);

	const handleThirdPartyIdSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!providerConfigState) return;

		const suffixValue = e.target.value.trim();
		if (suffixValue === "") {
			setProviderConfigState({ ...providerConfigState, thirdPartyId: baseProviderId });
		} else {
			setProviderConfigState({
				...providerConfigState,
				thirdPartyId: `${baseProviderId}-${suffixValue}`,
			});
		}
	};

	const showSuffixField = () => {
		if (!providerConfigState) return;

		setIsSuffixFieldVisible(true);
		setProviderConfigState({
			...providerConfigState,
			thirdPartyId: baseProviderId,
		});
		// Clear any thirdPartyId errors when showing suffix field
		setErrors((prev) => {
			const { thirdPartyId, ...rest } = prev;
			return rest;
		});
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
		if (!providerConfigState) return;
		setProviderConfigState({
			...providerConfigState,
			userInfoMap: {
				...providerConfigState.userInfoMap,
				[name]: {
					...providerConfigState.userInfoMap[name],
					[key]: value,
				},
			},
		});
	};

	const handleEmailSelectChange = (value: EmailSelectState) => {
		if (!providerConfigState) return;
		setEmailSelectValue(value);
		if (value === "never") {
			setProviderConfigState({ ...providerConfigState, requireEmail: false });
		} else {
			setProviderConfigState({ ...providerConfigState, requireEmail: true });
		}
	};

	const handleAddNewClient = () => {
		if (!providerConfigState) return;

		let additionalConfig: [string, string | null][] = providerConfigState.clients[0]?.additionalConfig
			? [...providerConfigState.clients[0].additionalConfig]
			: [["", ""]];

		// Apply custom fields if needed
		if (customFields) {
			additionalConfig = customFields.map((field) => [field.id, ""] as [string, string | null]);
		}

		setProviderConfigState({
			...providerConfigState,
			clients: [
				...(providerConfigState?.clients ?? []),
				{
					clientId: "",
					clientSecret: "",
					clientType: "",
					scope: providerConfigState.clients[0]?.scope ? [...providerConfigState.clients[0].scope] : [""],
					additionalConfig,
					forcePKCE: providerConfigState.clients[0]?.forcePKCE || false,
					key: crypto.randomUUID(),
				},
			],
		});
	};

	const handleSave = async () => {
		if (!providerConfigState || !tenantInfo) return;

		setErrors({});

		const existingProviderIds = tenantInfo.thirdParty.providers.map((p) => p.thirdPartyId);
		const validationErrors = validateProviderConfig(
			providerConfigState,
			existingProviderIds,
			isAddingNewProvider,
			customFields
		);

		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			showErrorToast("Validation Error", "Please ensure all fields are correctly filled out before saving.");
			return;
		}

		try {
			setIsSaving(true);
			const normalizedConfig = normalizeProviderConfig(providerConfigState);
			const response = await createOrUpdateThirdPartyProvider(tenantId, normalizedConfig);

			if (response.status === "OK") {
				showSuccessToast("Success", "Provider configuration saved successfully");
				setIsEditing(false);
				await refetch();
				if (onSave) {
					onSave();
				}
			} else if (response.status === "BOXY_ERROR") {
				showErrorToast("Error", response.message);
			}
		} catch (error) {
			showErrorToast("Error", "Failed to save provider configuration");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading || !providerConfigState) {
		return <Loader type="list" />;
	}

	const formHasError = Object.values(errors).some((error) => error !== "");

	return (
		<Flex
			width="100%"
			direction="column"
			className={styles["provider-configuration"]}>
			{/* Header */}
			<Flex
				className={styles["provider-configuration__header"]}
				justify="between"
				align="center">
				<Flex
					align="center"
					gap="3">
					<ItemLabel
						size="2"
						className={styles["provider-configuration__header__label"]}>
						{isAddingNewProvider ? "Configure new provider" : "Provider Configuration"}
					</ItemLabel>
					{inBuiltProviderInfo && (
						<Badge
							size="2"
							variant="soft"
							color="gray"
							className={styles["provider-configuration__header__badge"]}>
							<img
								src={getImageUrl(inBuiltProviderInfo.icon)}
								alt={inBuiltProviderInfo.label}
								width="16px"
								height="16px"
							/>
							<Text
								size="2"
								weight="medium"
								className={styles["provider-configuration__header__badge__text"]}>
								{inBuiltProviderInfo.label}
							</Text>
						</Badge>
					)}
				</Flex>

				{/* Action buttons in header */}
				{isAddingNewProvider ? (
					<Flex
						align="center"
						gap="2">
						<Button
							variant="outline"
							color="gray"
							size="2"
							onClick={() => {
								// Reset suffix field visibility if no suffix was added
								if (providerConfigState && providerConfigState.thirdPartyId === baseProviderId) {
									setIsSuffixFieldVisible(false);
								}
								if (onCancel) {
									onCancel();
								}
							}}
							disabled={isSaving}>
							Cancel
						</Button>
						<Button
							size="2"
							onClick={handleSave}
							disabled={isSaving}>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</Flex>
				) : isEditing ? (
					<Flex
						align="center"
						gap="2">
						<Button
							variant="outline"
							color="gray"
							size="2"
							onClick={() => {
								setIsEditing(false);
								setErrors({});
								// Reset state
								if (providerConfigResponse) {
									setProviderConfigState(getInitialProviderState(providerConfigResponse, providerId));
								}
								// Reset suffix field visibility if no suffix was added
								if (providerConfigState && providerConfigState.thirdPartyId === baseProviderId) {
									setIsSuffixFieldVisible(false);
								}
							}}
							disabled={isSaving}>
							Cancel
						</Button>
						<Button
							size="2"
							onClick={handleSave}
							disabled={isSaving}>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</Flex>
				) : (
					<Flex
						align="center"
						gap="2">
						<Button
							variant="outline"
							size="2"
							onClick={() => setIsEditing(true)}>
							<Pencil1Icon />
							Edit
						</Button>

						<Button
							size="2"
							variant="soft"
							color="red"
							onClick={() => setIsDeleteModalOpen(true)}>
							<TrashIcon />
							Delete
						</Button>
					</Flex>
				)}
			</Flex>

			{/* Form Content */}
			<Flex
				className={styles["provider-configuration__form"]}
				width="100%"
				direction="column"
				gap="4">
				{/* Provider Information */}
				<Flex
					width="100%"
					direction="column"
					gap="4"
					px="3"
					pt="4">
					{/* Third Party ID - with suffix support for built-in and SAML providers */}
					{shouldUseSuffixField ? (
						<ProviderConfigSuffixInput
							baseProviderId={baseProviderId}
							suffixValue={
								providerConfigState.thirdPartyId.length > baseProviderId.length + 1
									? providerConfigState.thirdPartyId.slice(baseProviderId.length + 1)
									: ""
							}
							onSuffixChange={handleThirdPartyIdSuffixChange}
							onShowSuffixField={showSuffixField}
							isSuffixFieldVisible={isSuffixFieldVisible}
							error={errors.thirdPartyId}
							disabled={!isEditing}
						/>
					) : (
						<ProviderConfigInputRow
							label="Third Party ID"
							tooltip="The ID of the provider"
							required
							disabled={!isEditing || !isAddingNewProvider}
							value={providerConfigState.thirdPartyId}
							onChange={(e) =>
								setProviderConfigState({ ...providerConfigState, thirdPartyId: e.target.value })
							}
							error={errors.thirdPartyId}
						/>
					)}

					{/* Name */}
					{isSAMLProvider ? (
						<Flex
							direction="column"
							gap="1">
							<Flex
								align="center"
								gap="2">
								<ProviderConfigInputLabel
									label="Name"
									tooltip="The name of the provider"
									required={!isKnownThirdPartyId(providerConfigState.thirdPartyId)}
								/>
								<select
									disabled={!isEditing}
									value={providerConfigState.name}
									onChange={(e) =>
										setProviderConfigState({ ...providerConfigState, name: e.target.value })
									}
									className={styles["provider-configuration__saml-select"]}>
									<option value="">Select a name</option>
									{SAML_NAME_OPTIONS.map((option) => (
										<option
											key={option}
											value={option}>
											{option}
										</option>
									))}
								</select>
							</Flex>
							{errors.name && (
								<Text
									size="1"
									color="red"
									ml="2">
									{errors.name}
								</Text>
							)}
						</Flex>
					) : (
						<ProviderConfigInputRow
							label="Name"
							tooltip="The name of the provider"
							disabled={!isEditing}
							required={!isKnownThirdPartyId(providerConfigState.thirdPartyId)}
							value={providerConfigState.name}
							onChange={(e) => setProviderConfigState({ ...providerConfigState, name: e.target.value })}
							error={errors.name}
						/>
					)}
				</Flex>

				{/* Clients Section */}
				<Text
					size="3"
					weight="medium"
					className={styles["provider-configuration__form__clients__header"]}>
					Clients
				</Text>
				<Flex
					direction="column"
					gap="3"
					mt="3"
					mx="3">
					{providerConfigState.clients.map((client, index) => (
						<ClientConfigSection
							key={client.key}
							client={client}
							clientIndex={index}
							clientsCount={providerConfigState.clients.length}
							providerId={providerConfigState.thirdPartyId}
							errors={errors}
							customFields={customFields}
							setClient={(updatedClient) => {
								const newClients = [...providerConfigState.clients];
								newClients[index] = updatedClient;
								setProviderConfigState({ ...providerConfigState, clients: newClients });
							}}
							handleDeleteClient={() => {
								setProviderConfigState({
									...providerConfigState,
									clients: providerConfigState.clients.filter((_, i) => i !== index),
								});
							}}
							disabled={!isEditing}
						/>
					))}
					<Button
						variant="soft"
						size="2"
						onClick={handleAddNewClient}
						disabled={!isEditing}
						className={styles["provider-configuration__add-new-client"]}>
						<PlusIcon />
						Add New Client
					</Button>
				</Flex>
				<ProviderConfigSeparator />
				<Flex
					direction="column"
					gap="4"
					px="3"
					pb="4">
					{/* OIDC Discovery Endpoint */}
					<ProviderConfigInputRow
						label="OIDC Discovery Endpoint"
						tooltip="The OIDC discovery endpoint of the provider"
						disabled={!isEditing}
						value={providerConfigState.oidcDiscoveryEndpoint}
						onChange={(e) =>
							setProviderConfigState({ ...providerConfigState, oidcDiscoveryEndpoint: e.target.value })
						}
						error={errors.oidcDiscoveryEndpoint}
					/>

					<ProviderConfigSeparator />

					{/* Authorization Endpoint */}
					<ProviderConfigInputRow
						label="Authorization Endpoint"
						tooltip="The authorization endpoint of the provider"
						disabled={!isEditing || providerConfigResponse?.isGetAuthorisationRedirectUrlOverridden}
						value={
							providerConfigResponse?.isGetAuthorisationRedirectUrlOverridden
								? "Cannot edit this because you have provided a custom override"
								: providerConfigState.authorizationEndpoint
						}
						onChange={(e) =>
							setProviderConfigState({ ...providerConfigState, authorizationEndpoint: e.target.value })
						}
						error={errors.authorizationEndpoint}
					/>

					<ProviderConfigKeyValue
						label="Authorization Endpoint Query Params"
						tooltip="The query params to be sent to the authorization endpoint"
						items={providerConfigState.authorizationEndpointQueryParams}
						setItems={(items) =>
							setProviderConfigState({ ...providerConfigState, authorizationEndpointQueryParams: items })
						}
						disabled={!isEditing || providerConfigResponse?.isGetAuthorisationRedirectUrlOverridden}
					/>

					{providerConfigResponse?.isGetAuthorisationRedirectUrlOverridden && (
						<Text
							size="2"
							color="orange"
							className={styles["provider-configuration__warning-text"]}>
							<strong>Note:</strong> You cannot edit the above fields because this provider is using a
							custom override for <code>getAuthorisationRedirectUrl</code>
						</Text>
					)}

					<ProviderConfigSeparator />

					{/* Token Endpoint */}
					<ProviderConfigInputRow
						label="Token Endpoint"
						tooltip="The token endpoint of the provider"
						disabled={!isEditing || providerConfigResponse?.isExchangeAuthCodeForOAuthTokensOverridden}
						value={
							providerConfigResponse?.isExchangeAuthCodeForOAuthTokensOverridden
								? "Cannot edit this because you have provided a custom override"
								: providerConfigState.tokenEndpoint
						}
						onChange={(e) =>
							setProviderConfigState({ ...providerConfigState, tokenEndpoint: e.target.value })
						}
						error={errors.tokenEndpoint}
					/>

					<ProviderConfigKeyValue
						label="Token Endpoint Body Params"
						tooltip="The body params to be sent to the token endpoint"
						items={providerConfigState.tokenEndpointBodyParams}
						setItems={(items) =>
							setProviderConfigState({ ...providerConfigState, tokenEndpointBodyParams: items })
						}
						disabled={!isEditing || providerConfigResponse?.isExchangeAuthCodeForOAuthTokensOverridden}
					/>

					{providerConfigResponse?.isExchangeAuthCodeForOAuthTokensOverridden && (
						<Text
							size="2"
							color="orange"
							className={styles["provider-configuration__warning-text"]}>
							<strong>Note:</strong> You cannot edit the above fields because this provider is using a
							custom override for <code>exchangeAuthCodeForOAuthTokens</code>
						</Text>
					)}

					<ProviderConfigSeparator />

					{/* User Info Endpoint */}
					<ProviderConfigInputRow
						label="User Info Endpoint"
						tooltip="The user info endpoint of the provider"
						disabled={!isEditing || providerConfigResponse?.isGetUserInfoOverridden}
						value={
							providerConfigResponse?.isGetUserInfoOverridden
								? "Cannot edit this because you have provided a custom override"
								: providerConfigState.userInfoEndpoint
						}
						onChange={(e) =>
							setProviderConfigState({ ...providerConfigState, userInfoEndpoint: e.target.value })
						}
						error={errors.userInfoEndpoint}
					/>

					<ProviderConfigKeyValue
						label="User Info Endpoint Query Params"
						tooltip="The query params to be sent to the user info endpoint"
						items={providerConfigState.userInfoEndpointQueryParams}
						setItems={(items) =>
							setProviderConfigState({ ...providerConfigState, userInfoEndpointQueryParams: items })
						}
						disabled={!isEditing || providerConfigResponse?.isGetUserInfoOverridden}
					/>

					<ProviderConfigKeyValue
						label="User Info Endpoint Headers"
						tooltip="The headers to be sent to the user info endpoint"
						items={providerConfigState.userInfoEndpointHeaders}
						setItems={(items) =>
							setProviderConfigState({ ...providerConfigState, userInfoEndpointHeaders: items })
						}
						disabled={!isEditing || providerConfigResponse?.isGetUserInfoOverridden}
					/>

					{/* Email Frequency */}
					<Flex
						align="center"
						gap="2">
						<ProviderConfigInputLabel label="How often does the provider return email?" />
						<EmailSelect
							value={emailSelectValue}
							setValue={handleEmailSelectChange}
							disabled={!isEditing}
						/>
					</Flex>

					{emailSelectValue === "never" && (
						<Text
							size="2"
							color="orange"
							className={styles["provider-configuration__warning-text"]}>
							<strong>Note:</strong> We will generate a fake email for the end users automatically using
							their user id.
						</Text>
					)}

					{emailSelectValue === "sometimes" && (
						<Flex
							align="center"
							gap="2">
							<ProviderConfigInputLabel label="Do you want to generate a fake email when the provider doesn't return an email?" />
							<Switch
								checked={!providerConfigState.requireEmail}
								onCheckedChange={(checked) =>
									setProviderConfigState({ ...providerConfigState, requireEmail: !checked })
								}
								disabled={!isEditing}
							/>
						</Flex>
					)}

					{/* User Info Maps */}
					<UserInfoMapSection
						label="User Info Map from UserInfo API"
						tooltip="The mapping of the user info fields to the user info API"
						name="fromUserInfoAPI"
						value={
							providerConfigState.userInfoMap.fromUserInfoAPI ?? {
								userId: "",
								email: "",
								emailVerified: "",
							}
						}
						handleChange={handleUserInfoFieldChange}
						disabled={!isEditing || providerConfigResponse?.isGetUserInfoOverridden}
						isOverridden={providerConfigResponse?.isGetUserInfoOverridden}
					/>

					<UserInfoMapSection
						label="User Info Map from Id Token Payload"
						tooltip="The mapping of the user info fields to the id token payload"
						name="fromIdTokenPayload"
						value={
							providerConfigState.userInfoMap.fromIdTokenPayload ?? {
								userId: "",
								email: "",
								emailVerified: "",
							}
						}
						handleChange={handleUserInfoFieldChange}
						disabled={!isEditing || providerConfigResponse?.isGetUserInfoOverridden}
						isOverridden={providerConfigResponse?.isGetUserInfoOverridden}
					/>

					{providerConfigResponse?.isGetUserInfoOverridden && (
						<Text
							size="2"
							color="orange"
							className={styles["provider-configuration__warning-text"]}>
							<strong>Note:</strong> You cannot edit the above fields because this provider is using a
							custom override for <code>getUserInfo</code>
						</Text>
					)}

					<ProviderConfigSeparator />

					{/* JWKS URI */}
					<ProviderConfigInputRow
						label="JWKS URI"
						tooltip="The JWKS URI of the provider"
						disabled={!isEditing}
						value={providerConfigState.jwksURI}
						onChange={(e) => setProviderConfigState({ ...providerConfigState, jwksURI: e.target.value })}
						error={errors.jwksURI}
					/>
				</Flex>
			</Flex>

			{/* Delete Modal */}
			<DeleteProviderConfigModal
				open={isDeleteModalOpen}
				handleClose={() => setIsDeleteModalOpen(false)}
				tenantId={tenantId}
				providerId={providerId}
				onSuccess={() => {
					setIsDeleteModalOpen(false);
					if (onDelete) {
						onDelete();
					}
				}}
			/>
			{/* Footer - Save button for when editing */}
			{isEditing && (
				<>
					<ProviderConfigSeparator
						mx="0"
						my="0"
					/>
					<Flex
						justify="end"
						p="4"
						gap="2"
						align="center">
						{formHasError && (
							<Text
								size="2"
								color="red">
								Please ensure all fields are correctly filled out before saving.
							</Text>
						)}
						<Button
							size="2"
							variant="outline"
							color="gray"
							onClick={() => {
								// Reset suffix field visibility if no suffix was added
								if (providerConfigState && providerConfigState.thirdPartyId === baseProviderId) {
									setIsSuffixFieldVisible(false);
								}

								if (isAddingNewProvider && onCancel) {
									// When adding new provider, call onCancel to go back
									onCancel();
								} else {
									// When editing existing provider, just exit edit mode
									setIsEditing(false);
								}
							}}>
							Cancel
						</Button>

						<Button
							size="2"
							onClick={handleSave}
							disabled={isSaving}>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</Flex>
				</>
			)}
		</Flex>
	);
};
