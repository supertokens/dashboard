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
import { Box, Flex, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";
import ItemLabel from "@shared/components/itemLabel";
import TabSelector from "@shared/components/tabSelector";
import EmptyList from "@shared/components/empty";
import { getImageUrl } from "@shared/utils/index";
import { IN_BUILT_THIRD_PARTY_PROVIDERS } from "@constants";
import AddNewProviderModal from "@features/tenants/modals/AddNewProviderModal";
import { ProviderConfiguration } from "./provider-configuration/ProviderConfiguration";

import styles from "./Providers.module.scss";

export const Providers = ({
	tenantId,
	tenantInfo,
}: {
	tenantId: string;
	tenantInfo: { thirdParty: { providers: { thirdPartyId: string; name: string }[] } };
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
			</TabSelector.ContentHeading>
			{tenantInfo.thirdParty.providers.length === 0 && !isAddingNewProvider ? (
				<EmptyList
					iconUrl="permission.svg"
					title="No providers are configured"
					description="Add at least one provider to enable third-party login for your users. Click 'Add Provider' to get started."
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
							<ProviderConfiguration
								tenantId={tenantId}
								providerId={selectedProvider}
								isAddingNewProvider={false}
								onDelete={handleProviderDeleted}
							/>
						</Box>
					)}
					{isAddingNewProvider && newProviderId && (
						<Box
							m="4"
							className={styles["providers-content__form"]}>
							<ProviderConfiguration
								tenantId={tenantId}
								providerId={newProviderId}
								isAddingNewProvider={true}
								onSave={handleProviderSaved}
							/>
						</Box>
					)}
				</>
			)}
		</Flex>
	);
};
