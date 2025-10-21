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

import { useState, useEffect } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";
import ItemLabel from "@shared/components/itemLabel";
import TabSelector from "@shared/components/tabSelector";
import EmptyList from "@shared/components/empty";
import Loader from "@shared/components/loader";
import { getImageUrl } from "@shared/utils/index";
import { IN_BUILT_THIRD_PARTY_PROVIDERS, FactorIds } from "@shared/constants";
import { useGetThirdPartyProviderInfoService } from "@api/tenants";
import type { ProviderConfigResponse } from "@api/tenants/types";
import AddNewProviderModal from "@features/tenants/modals/AddNewProviderModal";
import { PROVIDERS_WITH_ADDITIONAL_CONFIG } from "@features/tenants/constants/providers";
import { ProviderConfiguration } from "./provider-configuration/ProviderConfiguration";
import { AdditionalConfigForms } from "./provider-configuration/AdditionalConfigForms";

import styles from "./Providers.module.scss";

export const Providers = ({
	tenantId,
	tenantInfo,
}: {
	tenantId: string;
	tenantInfo: {
		thirdParty: { providers: { thirdPartyId: string; name: string }[] };
		firstFactors: string[];
	};
}) => {
	const [isNewProviderModalOpen, setIsNewProviderModalOpen] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState<string | undefined>(
		tenantInfo.thirdParty.providers.length > 0 ? tenantInfo.thirdParty.providers[0].thirdPartyId : undefined
	);
	const [newProviderId, setNewProviderId] = useState<string | undefined>(undefined);
	const [isAddingNewProvider, setIsAddingNewProvider] = useState(false);

	const handleSelectProvider = (providerId: string) => {
		setSelectedProvider(providerId);
		setIsAddingNewProvider(false);
		setNewProviderId(undefined);
	};

	const handleProviderDeleted = () => {
		setSelectedProvider(
			tenantInfo.thirdParty.providers.length > 0 ? tenantInfo.thirdParty.providers[0].thirdPartyId : undefined
		);
		setIsAddingNewProvider(false);
		setNewProviderId(undefined);
	};

	const handleNewProviderSelected = (providerId: string) => {
		setNewProviderId(providerId);
		setIsAddingNewProvider(true);
		setSelectedProvider(undefined);
	};

	const handleProviderSaved = () => {
		setIsAddingNewProvider(false);
		setNewProviderId(undefined);
		// The tenant info will be refreshed, so we'll see the new provider
	};

	const handleCancelAddProvider = () => {
		setIsAddingNewProvider(false);
		setNewProviderId(undefined);
	};

	const getProviderIcon = (thirdPartyId: string) => {
		const builtInProvider = IN_BUILT_THIRD_PARTY_PROVIDERS.find((p) => thirdPartyId.startsWith(p.id));
		if (builtInProvider) {
			return builtInProvider.icon;
		}
		return "permission.svg";
	};

	const getProviderName = (provider: { thirdPartyId: string; name: string }) => {
		return provider.name || provider.thirdPartyId;
	};

	const tenantHasThirdPartyEnabled = tenantInfo.firstFactors?.includes(FactorIds.THIRDPARTY);

	return (
		<Flex
			width="100%"
			direction="column">
			<TabSelector.ContentHeading
				justify="between"
				align="center">
				<ItemLabel>
					Configure third-party OAuth 2.0/OIDC/SAML providers available for user sign-in/sign-up
				</ItemLabel>
				{tenantHasThirdPartyEnabled && (
					<>
						<Button
							m="0"
							size="2"
							onClick={() => setIsNewProviderModalOpen(true)}>
							<PlusIcon />
							Add Provider
						</Button>
						<AddNewProviderModal
							open={isNewProviderModalOpen}
							handleClose={() => setIsNewProviderModalOpen(false)}
							tenantId={tenantId}
							onProviderSelected={handleNewProviderSelected}
						/>
					</>
				)}
			</TabSelector.ContentHeading>
			{tenantInfo.thirdParty.providers.length === 0 && !isAddingNewProvider ? (
				<EmptyList
					iconUrl="permission.svg"
					title="No providers are configured"
					description={
						tenantHasThirdPartyEnabled
							? "Add at least one provider to enable third-party login for your users. Click 'Add Provider' to get started."
							: "Third-party login is not enabled for this tenant. Enable it in the Login Methods tab to configure providers."
					}
				/>
			) : (
				<>
					{tenantInfo.thirdParty.providers.length > 0 && (
						<Flex
							px="4"
							py="3"
							gap="4"
							className={styles["providers-content__active-providers"]}>
							{tenantInfo.thirdParty.providers.map((provider) => {
								const isActive = selectedProvider === provider.thirdPartyId;
								const buttonClass = `${styles["provider-button"]} ${
									isActive ? styles["provider-button--active"] : ""
								}`;
								const labelClass = `${styles["provider-button__label"]} ${
									isActive ? styles["provider-button__label--active"] : ""
								}`;

								return (
									<Button
										key={provider.thirdPartyId}
										className={buttonClass}
										variant="outline"
										radius="large"
										onClick={() => handleSelectProvider(provider.thirdPartyId)}>
										<img
											src={getImageUrl(getProviderIcon(provider.thirdPartyId))}
											alt={getProviderName(provider)}
											width="30px"
											height="30px"
										/>
										<Text
											size="2"
											weight="medium"
											className={labelClass}>
											{getProviderName(provider)}
										</Text>
									</Button>
								);
							})}
						</Flex>
					)}
					{selectedProvider && !isAddingNewProvider && (
						<Box
							m="4"
							className={styles["providers-content__form"]}>
							<ProviderConfigWrapper
								tenantId={tenantId}
								providerId={selectedProvider}
								isAddingNewProvider={false}
								onDelete={handleProviderDeleted}
								onCancel={handleCancelAddProvider}
							/>
						</Box>
					)}
					{isAddingNewProvider && newProviderId && (
						<Box
							m="4"
							className={styles["providers-content__form"]}>
							<ProviderConfigWrapper
								tenantId={tenantId}
								providerId={newProviderId}
								isAddingNewProvider={true}
								onSave={handleProviderSaved}
								onCancel={handleCancelAddProvider}
							/>
						</Box>
					)}
				</>
			)}
		</Flex>
	);
};

interface ProviderConfigWrapperProps {
	tenantId: string;
	providerId: string;
	isAddingNewProvider: boolean;
	onDelete?: () => void;
	onSave?: () => void;
	onCancel?: () => void;
}

/**
 * Wrapper component that handles the multi-step flow for providers with additional config
 * (google-workspaces, active-directory, okta, boxy-saml)
 *
 * Flow:
 * 1. If provider needs additional config AND is being added → Show additional config form first
 * 2. User fills additional config → Fetch provider info with that config
 * 3. Then show full provider configuration form
 * 4. For editing existing providers OR providers without additional config → Show full form directly
 */
const ProviderConfigWrapper = ({
	tenantId,
	providerId,
	isAddingNewProvider,
	onDelete,
	onSave,
	onCancel,
}: ProviderConfigWrapperProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [providerConfigResponse, setProviderConfigResponse] = useState<ProviderConfigResponse | undefined>();
	const [hasFilledAdditionalConfig, setHasFilledAdditionalConfig] = useState(
		!PROVIDERS_WITH_ADDITIONAL_CONFIG.includes(providerId)
	);
	const [additionalConfig, setAdditionalConfig] = useState<Record<string, string> | undefined>();

	const getThirdPartyProviderInfo = useGetThirdPartyProviderInfoService();
	const providerNeedsAdditionalConfig = PROVIDERS_WITH_ADDITIONAL_CONFIG.includes(providerId);

	useEffect(() => {
		const fetchProviderInfo = async () => {
			try {
				setIsLoading(true);
				const response = await getThirdPartyProviderInfo(tenantId, providerId, additionalConfig);
				if (response.status === "OK") {
					setProviderConfigResponse(response.providerConfig);

					// Special case for boxy-saml: check if boxyAPIKey is present
					if (
						providerId.startsWith("boxy-saml") &&
						response.providerConfig.clients?.[0]?.additionalConfig?.boxyAPIKey === undefined
					) {
						setHasFilledAdditionalConfig(false);
					} else {
						setHasFilledAdditionalConfig(true);
					}
				}
			} catch (error) {
				console.error("Failed to fetch provider info:", error);
			} finally {
				setIsLoading(false);
			}
		};

		// Fetch provider info if:
		// 1. Not adding new provider (editing existing)
		// 2. OR adding new provider that doesn't need additional config
		// 3. OR adding new provider that needs additional config and has filled it
		// 4. OR it's boxy-saml (special case - always fetch to check boxyAPIKey)
		if (
			!isAddingNewProvider ||
			!providerNeedsAdditionalConfig ||
			hasFilledAdditionalConfig ||
			providerId.startsWith("boxy-saml")
		) {
			void fetchProviderInfo();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tenantId, providerId, isAddingNewProvider, additionalConfig, hasFilledAdditionalConfig]);

	const handleAdditionalConfigContinue = (config: Record<string, string>) => {
		setAdditionalConfig(config);
		setHasFilledAdditionalConfig(true);
	};

	// Show additional config form if:
	// 1. Provider needs additional config
	// 2. User hasn't filled it yet
	// 3. AND (adding new provider OR editing boxy-saml without boxyAPIKey)
	const shouldShowAdditionalConfigForm =
		providerNeedsAdditionalConfig && !hasFilledAdditionalConfig && isAddingNewProvider;

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
	};

	if (shouldShowAdditionalConfigForm) {
		return (
			<AdditionalConfigForms
				providerId={providerId}
				onContinue={handleAdditionalConfigContinue}
				onCancel={handleCancel}
				currentAdditionalConfig={providerConfigResponse?.clients?.[0]?.additionalConfig}
			/>
		);
	}

	// Special case: boxy-saml without boxyAPIKey (editing existing provider)
	if (
		providerId.startsWith("boxy-saml") &&
		!hasFilledAdditionalConfig &&
		providerConfigResponse?.clients?.[0]?.additionalConfig?.boxyAPIKey === undefined
	) {
		return (
			<AdditionalConfigForms
				providerId={providerId}
				onContinue={handleAdditionalConfigContinue}
				onCancel={handleCancel}
				currentAdditionalConfig={providerConfigResponse?.clients?.[0]?.additionalConfig}
			/>
		);
	}

	if (isLoading) {
		return <Loader type="list" />;
	}

	// Show full provider configuration form
	return (
		<ProviderConfiguration
			tenantId={tenantId}
			providerId={providerId}
			isAddingNewProvider={isAddingNewProvider}
			onDelete={onDelete}
			onSave={onSave}
			onCancel={onCancel}
			providerConfigResponse={providerConfigResponse}
			additionalConfig={additionalConfig}
		/>
	);
};
