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

import { Button, Flex, Switch, Text, TextArea } from "@radix-ui/themes";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";

import IconButton from "@shared/components/iconButton";

import type { ProviderClientState } from "../providerConfigHelpers";
import { ProviderConfigInputLabel } from "./ProviderConfigInputLabel";
import { ProviderConfigInputRow } from "./ProviderConfigInputRow";
import { ProviderConfigSeparator } from "./ProviderConfigSeparator";
import { ProviderConfigCancelButton } from "./ProviderConfigCancelButton";
import { ProviderConfigKeyValue } from "./ProviderConfigKeyValue";
import providerStyles from "../ProviderConfiguration.module.scss";
import styles from "./ClientConfigSection.module.scss";
import { ProviderConfigInput } from "./ProviderConfigInput";

interface ProviderCustomField {
	label: string;
	id: string;
	tooltip: string;
	type: string;
	required: boolean;
}

interface ClientConfigSectionProps {
	client: ProviderClientState;
	clientIndex: number;
	clientsCount: number;
	providerId: string;
	errors: Record<string, string>;
	customFields?: ProviderCustomField[];
	setClient: (client: ProviderClientState) => void;
	handleDeleteClient: () => void;
	disabled?: boolean;
}

export const ClientConfigSection = ({
	client,
	clientIndex,
	clientsCount,
	providerId,
	errors,
	customFields,
	setClient,
	handleDeleteClient,
	disabled,
}: ClientConfigSectionProps) => {
	const isAppleProvider = providerId.startsWith("apple");

	const handleScopeChange = (scopeIndex: number, newScope: string) => {
		const newScopes = [...client.scope];
		newScopes[scopeIndex] = newScope;
		setClient({ ...client, scope: newScopes });
	};

	const handleRemoveScope = (scopeIndex: number) => {
		setClient({ ...client, scope: client.scope.filter((_, i) => i !== scopeIndex) });
	};

	const handleAddScope = () => {
		setClient({ ...client, scope: [...client.scope, ""] });
	};

	const handleCustomFieldChange = (fieldId: string, value: string) => {
		const newConfig = [...client.additionalConfig];
		const existingIndex = newConfig.findIndex(([key]) => key === fieldId);
		if (existingIndex >= 0) {
			newConfig[existingIndex] = [fieldId, value];
		} else {
			newConfig.push([fieldId, value]);
		}
		setClient({ ...client, additionalConfig: newConfig });
	};

	const getCustomFieldValue = (fieldId: string): string => {
		return client.additionalConfig.find(([key]) => key === fieldId)?.[1] || "";
	};

	return (
		<Flex
			direction="column"
			gap="3"
			p="3"
			className={providerStyles["provider-configuration-client"]}>
			{clientsCount > 1 && (
				<Flex
					justify="end"
					p="2"
					className={providerStyles["provider-configuration-client__delete"]}>
					<IconButton
						variant="soft"
						color="gray"
						onClick={handleDeleteClient}
						disabled={disabled}>
						<TrashIcon />
					</IconButton>
				</Flex>
			)}

			<ProviderConfigInputRow
				label="Client Id"
				required
				disabled={disabled}
				value={client.clientId}
				onChange={(e) => setClient({ ...client, clientId: e.target.value })}
				error={errors[`clients.${clientIndex}.clientId`]}
			/>

			{!isAppleProvider && (
				<ProviderConfigInputRow
					label="Client Secret"
					required
					disabled={disabled}
					value={client.clientSecret}
					onChange={(e) => setClient({ ...client, clientSecret: e.target.value })}
					error={errors[`clients.${clientIndex}.clientSecret`]}
				/>
			)}

			<ProviderConfigInputRow
				label="Client Type"
				tooltip="Client type is useful when you have multiple clients for the same provider, for different client types like web, mobile, etc."
				required={clientsCount > 1}
				disabled={disabled}
				value={client.clientType}
				onChange={(e) => setClient({ ...client, clientType: e.target.value })}
				error={errors[`clients.${clientIndex}.clientType`]}
			/>

			<ProviderConfigSeparator mx="0" />

			{/* Scopes */}
			<Flex gap="2">
				<ProviderConfigInputLabel label="Scopes" />
				<Flex
					direction="column"
					width="100%"
					gap="3">
					{client.scope.map((scope, scopeIndex) => (
						<Flex
							key={scopeIndex}
							gap="2"
							align="center">
							<ProviderConfigInput
								disabled={disabled}
								value={scope}
								onChange={(e) => handleScopeChange(scopeIndex, e.target.value)}
							/>
							<ProviderConfigCancelButton
								onClick={() => handleRemoveScope(scopeIndex)}
								disabled={disabled}
							/>
						</Flex>
					))}
					<ProviderConfigSeparator mx="0" />
					<Button
						variant="outline"
						size="2"
						color="gray"
						onClick={handleAddScope}
						disabled={disabled}
						className={styles["client-config-section__add-scope-button"]}>
						<PlusIcon />
						Add New
					</Button>
				</Flex>
			</Flex>

			{/* Additional Config / Custom Fields */}
			{customFields && customFields.length > 0 && (
				<>
					<ProviderConfigSeparator mx="0" />
					<Flex
						direction="column"
						gap="3">
						<Text
							size="2"
							weight="medium">
							Additional Configuration
						</Text>
						{customFields.map((field) => {
							const fieldValue = getCustomFieldValue(field.id);
							const fieldError = errors[`clients.${clientIndex}.additionalConfig.${field.id}`];

							if (field.type === "multiline") {
								return (
									<Flex
										key={field.id}
										direction="column"
										gap="1">
										<ProviderConfigInputLabel
											label={field.label}
											required={field.required}
											tooltip={field.tooltip}
										/>
										<TextArea
											disabled={disabled}
											value={fieldValue}
											onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
											rows={4}
											className={`${styles["client-config-section__custom-field-textarea"]} ${
												disabled
													? styles["client-config-section__custom-field-textarea--disabled"]
													: ""
											} `}
										/>
										{fieldError && (
											<Text
												size="1"
												color="red">
												{fieldError}
											</Text>
										)}
									</Flex>
								);
							}

							return (
								<ProviderConfigInputRow
									key={field.id}
									label={field.label}
									required={field.required}
									disabled={disabled}
									value={fieldValue}
									onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
									tooltip={field.tooltip}
									error={fieldError}
								/>
							);
						})}
					</Flex>
				</>
			)}

			{/* General Additional Config (Key-Value pairs) - Always shown */}
			<ProviderConfigSeparator mx="0" />
			<ProviderConfigKeyValue
				label="Additional Config"
				tooltip="Additional configuration for the provider for this client."
				items={client.additionalConfig}
				setItems={(items: [string, string | null][]) => setClient({ ...client, additionalConfig: items })}
				disabled={disabled}
				fixedFields={customFields?.map((field) => field.id) ?? []}
			/>

			{/* Force PKCE */}
			<Flex
				align="center"
				gap="2">
				<ProviderConfigInputLabel
					label="Force PKCE"
					withIcon={true}
				/>
				<Switch
					checked={client.forcePKCE || false}
					onCheckedChange={(checked) => setClient({ ...client, forcePKCE: checked })}
					disabled={disabled}
				/>
			</Flex>
		</Flex>
	);
};
