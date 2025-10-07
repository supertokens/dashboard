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

import { useEffect, useState } from "react";
import { Badge, Flex, SegmentedControl, Separator, Switch, Text, TextField, Tooltip } from "@radix-ui/themes";
import { Cross1Icon, InfoCircledIcon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";
import ItemLabel from "@shared/components/itemLabel";
import Loader from "@shared/components/loader";
import IconButton from "@shared/components/iconButton";
import { useToast } from "@shared/components/toast";
import { getImageUrl } from "@shared/utils/index";
import { NOOP } from "@shared/utils/noop";
import { IN_BUILT_THIRD_PARTY_PROVIDERS, SAML_PROVIDER_ID } from "@constants";
import { useGetThirdPartyProviderInfoService, useCreateOrUpdateThirdPartyProviderService } from "@api/tenants";
import type { ProviderConfigResponse } from "@api/tenants/types";
import { useTenantDetails } from "@features/tenants/hooks/useTenantDetails";
import DeleteProviderConfigModal from "@features/tenants/modals/DeleteProviderConfigModal";
import { IN_BUILT_PROVIDERS_CUSTOM_FIELDS_FOR_CLIENT, SAML_NAME_OPTIONS } from "@features/tenants/constants/providers";

import {
	getInitialProviderState,
	isKnownThirdPartyId,
	normalizeProviderConfig,
	type ProviderClientState,
	type ProviderConfigState,
} from "./providerConfigHelpers";
import { validateProviderConfig } from "./providerConfigValidation";
import styles from "./ProviderConfiguration.module.scss";

// ===== Subcomponents =====

const ProviderConfigSeparator = ({ ...props }) => (
	<Flex
		m="3"
		{...props}>
		<Separator className={styles["provider-config-separator"]} />
	</Flex>
);

const ProviderConfigInput = ({
	disabled = false,
	readonly = false,
	value,
	onChange,
	placeholder,
	error,
}: {
	disabled?: boolean;
	readonly?: boolean;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	error?: string;
}) => (
	<Flex
		direction="column"
		gap="1"
		style={{ flex: 1 }}>
		<TextField.Root
			size="3"
			variant="surface"
			disabled={disabled}
			readOnly={readonly}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
		/>
		{error && (
			<Text
				size="1"
				color="red">
				{error}
			</Text>
		)}
	</Flex>
);

const ProviderConfigInputLabel = ({
	label,
	withIcon = true,
	required = false,
	tooltip,
}: {
	label: string;
	withIcon?: boolean;
	required?: boolean;
	tooltip?: string;
}) => {
	const content = (
		<Flex
			align="center"
			gap="2"
			style={{ minWidth: "200px" }}>
			{withIcon && (
				<InfoCircledIcon
					width={16}
					height={16}
				/>
			)}
			<Text
				size="2"
				weight="regular">
				{label}
				{required && (
					<Text
						size="2"
						weight="regular"
						color="red">
						*
					</Text>
				)}
				:
			</Text>
		</Flex>
	);

	if (tooltip) {
		return <Tooltip content={<Text size="2">{tooltip}</Text>}>{content}</Tooltip>;
	}

	return content;
};

const ProviderConfigInputRow = ({
	label,
	withIcon = true,
	required,
	disabled,
	readonly,
	value,
	onChange,
	tooltip,
	error,
}: {
	label: string;
	withIcon?: boolean;
	required?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	tooltip?: string;
	error?: string;
}) => (
	<Flex
		align="center"
		gap="2"
		style={{ width: "100%" }}>
		<ProviderConfigInputLabel
			label={label}
			withIcon={withIcon}
			required={required}
			tooltip={tooltip}
		/>
		<ProviderConfigInput
			disabled={disabled}
			readonly={readonly}
			value={value}
			onChange={onChange}
			error={error}
		/>
	</Flex>
);

const ProviderConfigCancelButton = ({ onClick = NOOP }: { onClick?: () => void }) => (
	<IconButton
		size="2"
		variant="soft"
		color="gray"
		onClick={onClick}>
		<Cross1Icon />
	</IconButton>
);

const ProviderConfigKeyValue = ({
	label,
	tooltip,
	items,
	setItems,
	disabled,
}: {
	label: string;
	tooltip?: string;
	items: [string, string | null][];
	setItems: (items: [string, string | null][]) => void;
	disabled?: boolean;
}) => (
	<Flex
		direction="column"
		gap="2"
		style={{ width: "100%" }}>
		<ProviderConfigInputLabel
			label={label}
			tooltip={tooltip}
		/>
		<Flex
			direction="column"
			gap="2"
			p="3"
			style={{ background: "var(--gray-a2)", borderRadius: "var(--radius-2)" }}>
			{items.map((item, index) => (
				<Flex
					key={index}
					gap="2"
					align="center">
					<TextField.Root
						size="3"
						variant="surface"
						disabled={disabled}
						value={item[0]}
						onChange={(e) => {
							const newItems = [...items];
							newItems[index] = [e.target.value, item[1]];
							setItems(newItems);
						}}
						placeholder="Key"
						style={{ flex: 1 }}
					/>
					<TextField.Root
						size="3"
						variant="surface"
						disabled={disabled}
						value={item[1] || ""}
						onChange={(e) => {
							const newItems = [...items];
							newItems[index] = [item[0], e.target.value];
							setItems(newItems);
						}}
						placeholder="Value"
						style={{ flex: 1 }}
					/>
					<ProviderConfigCancelButton onClick={() => setItems(items.filter((_, i) => i !== index))} />
				</Flex>
			))}
			<Button
				variant="outline"
				size="2"
				color="gray"
				onClick={() => setItems([...items, ["", ""]])}>
				<PlusIcon />
				Add New
			</Button>
		</Flex>
	</Flex>
);

const UserInfoMapSection = ({
	label,
	tooltip,
	name,
	value,
	handleChange,
	disabled,
}: {
	label: string;
	tooltip: string;
	name: "fromIdTokenPayload" | "fromUserInfoAPI";
	value: { userId?: string; email?: string; emailVerified?: string };
	handleChange: (params: { name: "fromIdTokenPayload" | "fromUserInfoAPI"; key: string; value: string }) => void;
	disabled?: boolean;
}) => (
	<Flex
		direction="column"
		gap="2"
		style={{ width: "100%" }}>
		<ProviderConfigInputLabel
			label={label}
			tooltip={tooltip}
		/>
		<Flex
			direction="column"
			gap="3"
			p="3"
			style={{
				background: "var(--gray-a2)",
				borderRadius: "var(--radius-2)",
				border: "1px solid var(--gray-a4)",
			}}>
			<ProviderConfigInputRow
				label="userId"
				withIcon={false}
				disabled={disabled}
				value={disabled ? "Cannot edit this because you have provided a custom override" : value.userId}
				onChange={(e) => handleChange({ name, key: "userId", value: e.target.value })}
			/>
			<ProviderConfigInputRow
				label="email"
				withIcon={false}
				disabled={disabled}
				value={disabled ? "Cannot edit this because you have provided a custom override" : value.email}
				onChange={(e) => handleChange({ name, key: "email", value: e.target.value })}
			/>
			<ProviderConfigInputRow
				label="emailVerified"
				withIcon={false}
				disabled={disabled}
				value={disabled ? "Cannot edit this because you have provided a custom override" : value.emailVerified}
				onChange={(e) => handleChange({ name, key: "emailVerified", value: e.target.value })}
			/>
		</Flex>
	</Flex>
);

type EmailSelectState = "always" | "sometimes" | "never";

const EmailSelect = ({
	value,
	setValue,
	disabled,
}: {
	value: EmailSelectState;
	setValue: (value: EmailSelectState) => void;
	disabled?: boolean;
}) => (
	<SegmentedControl.Root
		value={value}
		onValueChange={(val) => setValue(val as EmailSelectState)}
		size="3"
		disabled={disabled}>
		<SegmentedControl.Item value="always">All the time</SegmentedControl.Item>
		<SegmentedControl.Item value="sometimes">Sometimes</SegmentedControl.Item>
		<SegmentedControl.Item value="never">Never</SegmentedControl.Item>
	</SegmentedControl.Root>
);

// ==== Client Configuration Component ====

const ClientConfigSection = ({
	client,
	clientIndex,
	clientsCount,
	providerId,
	errors,
	customFields,
	setClient,
	handleDeleteClient,
	disabled,
}: {
	client: ProviderClientState;
	clientIndex: number;
	clientsCount: number;
	providerId: string;
	errors: Record<string, string>;
	customFields?: Array<{ label: string; id: string; tooltip: string; type: string; required: boolean }>;
	setClient: (client: ProviderClientState) => void;
	handleDeleteClient: () => void;
	disabled?: boolean;
}) => {
	const isAppleProvider = providerId.startsWith("apple");

	return (
		<Flex
			direction="column"
			gap="3"
			p="3"
			style={{
				background: "var(--gray-a2)",
				borderRadius: "var(--radius-2)",
				border: "1px solid var(--gray-a4)",
			}}>
			{clientsCount > 1 && (
				<Flex justify="end">
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

			{clientsCount > 1 && (
				<ProviderConfigInputRow
					label="Client Type"
					required
					disabled={disabled}
					value={client.clientType}
					onChange={(e) => setClient({ ...client, clientType: e.target.value })}
					error={errors[`clients.${clientIndex}.clientType`]}
				/>
			)}

			<ProviderConfigSeparator mx="0" />

			{/* Scopes */}
			<Flex
				direction="column"
				gap="2">
				<ProviderConfigInputLabel label="Scopes" />
				<Flex
					direction="column"
					gap="2">
					{client.scope.map((scope, scopeIndex) => (
						<Flex
							key={scopeIndex}
							gap="2"
							align="center">
							<TextField.Root
								size="3"
								variant="surface"
								disabled={disabled}
								value={scope}
								onChange={(e) => {
									const newScopes = [...client.scope];
									newScopes[scopeIndex] = e.target.value;
									setClient({ ...client, scope: newScopes });
								}}
								style={{ flex: 1 }}
							/>
							<ProviderConfigCancelButton
								onClick={() =>
									setClient({ ...client, scope: client.scope.filter((_, i) => i !== scopeIndex) })
								}
							/>
						</Flex>
					))}
					<Button
						variant="outline"
						size="2"
						color="gray"
						onClick={() => setClient({ ...client, scope: [...client.scope, ""] })}
						disabled={disabled}>
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
							const fieldValue = client.additionalConfig.find(([key]) => key === field.id)?.[1] || "";
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
										<textarea
											disabled={disabled}
											value={fieldValue}
											onChange={(e) => {
												const newConfig = [...client.additionalConfig];
												const existingIndex = newConfig.findIndex(([key]) => key === field.id);
												if (existingIndex >= 0) {
													newConfig[existingIndex] = [field.id, e.target.value];
												} else {
													newConfig.push([field.id, e.target.value]);
												}
												setClient({ ...client, additionalConfig: newConfig });
											}}
											rows={4}
											style={{
												width: "100%",
												padding: "8px",
												borderRadius: "var(--radius-2)",
												border: "1px solid var(--gray-a6)",
												fontSize: "var(--font-size-2)",
											}}
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
									onChange={(e) => {
										const newConfig = [...client.additionalConfig];
										const existingIndex = newConfig.findIndex(([key]) => key === field.id);
										if (existingIndex >= 0) {
											newConfig[existingIndex] = [field.id, e.target.value];
										} else {
											newConfig.push([field.id, e.target.value]);
										}
										setClient({ ...client, additionalConfig: newConfig });
									}}
									tooltip={field.tooltip}
									error={fieldError}
								/>
							);
						})}
					</Flex>
				</>
			)}

			{/* Force PKCE */}
			<Flex
				align="center"
				gap="2">
				<ProviderConfigInputLabel
					label="Force PKCE"
					withIcon={false}
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

// ====== Main Component ======

interface ProviderConfigurationProps {
	tenantId: string;
	providerId: string;
	isAddingNewProvider: boolean;
	onDelete?: () => void;
	onSave?: () => void;
}

export const ProviderConfiguration = ({
	tenantId,
	providerId,
	isAddingNewProvider,
	onDelete,
	onSave,
}: ProviderConfigurationProps) => {
	const [isLoading, setIsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(isAddingNewProvider);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [providerConfigResponse, setProviderConfigResponse] = useState<ProviderConfigResponse | undefined>();
	const [providerConfigState, setProviderConfigState] = useState<ProviderConfigState | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [emailSelectValue, setEmailSelectValue] = useState<EmailSelectState>("always");

	const getThirdPartyProviderInfo = useGetThirdPartyProviderInfoService();
	const createOrUpdateThirdPartyProvider = useCreateOrUpdateThirdPartyProviderService();
	const { tenantInfo, refetch } = useTenantDetails(tenantId);
	const { showSuccessToast, showErrorToast } = useToast();

	const inBuiltProviderInfo = IN_BUILT_THIRD_PARTY_PROVIDERS.find((provider) => providerId?.startsWith(provider.id));
	const customFieldProviderKey = Object.keys(IN_BUILT_PROVIDERS_CUSTOM_FIELDS_FOR_CLIENT).find((id) =>
		providerId?.startsWith(id)
	);
	const customFields = customFieldProviderKey
		? IN_BUILT_PROVIDERS_CUSTOM_FIELDS_FOR_CLIENT[customFieldProviderKey]
		: undefined;

	const isSAMLProvider = providerId?.startsWith(SAML_PROVIDER_ID);

	useEffect(() => {
		const fetchProviderInfo = async () => {
			try {
				setIsLoading(true);
				const response = await getThirdPartyProviderInfo(tenantId, providerId);
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
	}, [tenantId, providerId, isAddingNewProvider]);

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
					<ItemLabel size="2">
						{isAddingNewProvider ? "Configure new provider" : "Provider Configuration"}
					</ItemLabel>
					{inBuiltProviderInfo && (
						<Badge
							size="2"
							variant="soft"
							color="gray">
							<img
								src={getImageUrl(inBuiltProviderInfo.icon)}
								alt={inBuiltProviderInfo.label}
								width="16px"
								height="16px"
							/>
							<Text
								size="2"
								weight="medium">
								{inBuiltProviderInfo.label}
							</Text>
						</Badge>
					)}
				</Flex>

				{!isAddingNewProvider &&
					(isEditing ? (
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
										setProviderConfigState(
											getInitialProviderState(providerConfigResponse, providerId)
										);
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
					))}
			</Flex>

			{/* Form Content */}
			<Flex
				className={styles["provider-configuration__form"]}
				width="100%"
				direction="column"
				p="4"
				gap="4">
				{/* Third Party ID */}
				<ProviderConfigInputRow
					label="Third Party ID"
					tooltip="The ID of the provider"
					required
					disabled={!isEditing || !isAddingNewProvider}
					value={providerConfigState.thirdPartyId}
					onChange={(e) => setProviderConfigState({ ...providerConfigState, thirdPartyId: e.target.value })}
					error={errors.thirdPartyId}
				/>

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
								style={{
									flex: 1,
									padding: "8px",
									borderRadius: "var(--radius-2)",
									border: "1px solid var(--gray-a6)",
									fontSize: "var(--font-size-2)",
								}}>
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

				<ProviderConfigSeparator />

				{/* Clients Section */}
				<Flex
					direction="column"
					gap="3">
					<Text
						size="3"
						weight="medium"
						className={styles["provider-configuration__form__clients__header"]}>
						Clients
					</Text>
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
						disabled={!isEditing}>
						<PlusIcon />
						Add New Client
					</Button>
				</Flex>

				<ProviderConfigSeparator />

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
						style={{ fontStyle: "italic" }}>
						<strong>Note:</strong> You cannot edit the above fields because this provider is using a custom
						override for <code>getAuthorisationRedirectUrl</code>
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
					onChange={(e) => setProviderConfigState({ ...providerConfigState, tokenEndpoint: e.target.value })}
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
						style={{ fontStyle: "italic" }}>
						<strong>Note:</strong> You cannot edit the above fields because this provider is using a custom
						override for <code>exchangeAuthCodeForOAuthTokens</code>
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
						style={{ fontStyle: "italic" }}>
						<strong>Note:</strong> We will generate a fake email for the end users automatically using their
						user id.
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
				/>

				{providerConfigResponse?.isGetUserInfoOverridden && (
					<Text
						size="2"
						color="orange"
						style={{ fontStyle: "italic" }}>
						<strong>Note:</strong> You cannot edit the above fields because this provider is using a custom
						override for <code>getUserInfo</code>
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

			{/* Footer - Save button for adding new provider */}
			{isAddingNewProvider && (
				<>
					<ProviderConfigSeparator />
					<Flex
						justify="end"
						p="4"
						gap="2">
						{formHasError && (
							<Text
								size="2"
								color="red">
								Please ensure all fields are correctly filled out before saving.
							</Text>
						)}
						<Button
							size="3"
							onClick={handleSave}
							disabled={isSaving}>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</Flex>
				</>
			)}

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
		</Flex>
	);
};
