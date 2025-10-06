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

import Button from "@shared/components/button";
import DashboardError from "@shared/components/error";
import ItemLabel from "@shared/components/itemLabel";
import Loader from "@shared/components/loader";
import AddNewProviderModal from "@features/roles-and-permissions/modals/addNewProvider";
import TabSelector from "@shared/components/tabSelector";
import {
	Cross1Icon,
	InfoCircledIcon,
	Pencil1Icon,
	PlusIcon,
	QuestionMarkCircledIcon,
	TrashIcon,
} from "@radix-ui/react-icons";
import {
	Badge,
	Box,
	ButtonProps,
	Flex,
	FlexProps,
	SegmentedControl,
	Separator,
	Switch,
	Text,
	TextField,
	Tooltip,
} from "@radix-ui/themes";
import { assertNever } from "@utils/assertNever";
import { getImageUrl } from "@utils/index";
import { useState } from "react";

import "./providers.scss";
import { NOOP } from "@utils/noop";
import IconButton from "@shared/components/iconButton";
import DeleteProviderConfigModal from "@features/tenants/modals/DeleteProviderConfigModal";

const ProviderConfigSeparator = ({ ...props }: FlexProps) => {
	return (
		<Flex
			m="3"
			{...props}>
			<Separator className="provider-config-separator" />
		</Flex>
	);
};

const ProviderConfigInput = ({
	disabled = true,
	readonly = false,
	grow = true,
}: {
	disabled?: boolean;
	readonly?: boolean;
	grow?: boolean;
}) => {
	return (
		<TextField.Root
			size="3"
			variant="surface"
			className={`provider-config-input ${disabled ? "provider-config-input--disabled" : ""} ${
				grow ? "provider-config-input--grow" : ""
			} ${readonly ? "provider-config-input--readonly" : ""}`}
			disabled={false}
			readOnly={readonly}></TextField.Root>
	);
};

const ProviderConfigInputLabel = ({
	label,
	withIcon = true,
	required = false,
	size = "sm",
}: {
	label: string;
	withIcon?: boolean;
	required?: boolean;
	size?: "sm" | "md";
}) => {
	return (
		<Flex
			align="center"
			gap="2"
			className={`provider-config-input-label provider-config-input-label--${size}`}>
			{withIcon && (
				<InfoCircledIcon
					width={16}
					height={16}
					className="provider-config-input-label__icon"
				/>
			)}
			<Text
				size="2"
				weight="regular"
				className="provider-config-input-label__text">
				{label}
				{required && (
					<Text
						size="2"
						weight="regular"
						className="provider-config-input-label__text--required">
						*
					</Text>
				)}
				:
			</Text>
		</Flex>
	);
};

const ProviderConfigInputRow = ({
	label,
	withIcon,
	required,
	disabled,
	readonly,
	size,
}: {
	label: string;
	withIcon?: boolean;
	required?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	size?: "sm" | "md";
}) => {
	return (
		<Flex
			className="provider-config-input-row"
			align="center"
			gap="2">
			<ProviderConfigInputLabel
				label={label}
				withIcon={withIcon}
				required={required}
				size={size}
			/>
			<ProviderConfigInput
				disabled={disabled}
				readonly={readonly}
			/>
		</Flex>
	);
};

const ProviderConfigButton = ({
	label,
	...props
}: {
	label: string;
} & ButtonProps) => {
	return (
		<Button
			variant="outline"
			size="2"
			color="gray"
			{...props}
			className="provider-config-button">
			<PlusIcon />
			{label}
		</Button>
	);
};

const ProviderConfigScopeInput = ({ disabled }: { disabled?: boolean }) => {
	const [scopes, setScopes] = useState<{ id: string; value: string }[]>([
		{ id: "1", value: "" },
		{ id: "2", value: "" },
	]);
	return (
		<Flex
			className="provider-config-scope"
			width="100%"
			gap="2">
			<ProviderConfigInputLabel
				label="Scopes"
				size="sm"
			/>
			<Flex
				direction="column"
				gap="3"
				className="provider-config-scope__inputs"
				width="100%">
				{scopes.map((scope) => (
					<Flex
						align="center"
						gap="2"
						className="provider-config-scope__inputs__input"
						key={scope.id}>
						<ProviderConfigInput disabled={disabled} />
						<ProviderConfigCancelButton
							onClick={() => setScopes(scopes.filter((s) => s.id !== scope.id))}
						/>
					</Flex>
				))}
				<ProviderConfigButton
					label="Add New"
					onClick={() => setScopes([...scopes, { id: crypto.randomUUID(), value: "" }])}
				/>
			</Flex>
		</Flex>
	);
};

const ProviderButton = ({ icon, label, isActive }: { icon: string; label: string; isActive: boolean }) => {
	return (
		<Button
			className={`provider-button ${isActive ? "provider-button--active" : ""}`}
			variant="outline"
			radius="large">
			<img
				src={getImageUrl(icon)}
				alt={label}
				width="30px"
				height="30px"
			/>
			<Text
				size="2"
				weight="medium"
				className={`provider-button__label ${isActive ? "provider-button__label--active" : ""}`}>
				{label}
			</Text>
		</Button>
	);
};

const ProviderSetup = ({
	handleCancel,
	handleContinue,
	providerName,
	providerIcon,
	formLabel,
	formTitle,
	formFooter,
}: {
	handleCancel: () => void;
	handleContinue: () => void;
	providerName: string;
	providerIcon: string;
	formLabel: string;
	formTitle: string;
	formFooter: string;
}) => {
	return (
		<Flex
			className="provider-setup"
			direction="column">
			<Flex
				justify="between"
				align="center"
				className="provider-setup__header"
				p="3">
				<Flex
					gap="3"
					align="center">
					<Text
						size="2"
						className="provider-setup__header__title">
						Configure new provider
					</Text>
					<Badge
						size="2"
						color="gray"
						className="provider-setup__header__badge">
						<img
							src={providerIcon}
							alt={providerName}
							width="16px"
							height="16px"
						/>
						<Text
							size="2"
							weight="medium"
							className="provider-setup__header__badge__text">
							{providerName}
						</Text>
					</Badge>
				</Flex>
				<Flex
					align="center"
					gap="2">
					<Button
						size="2"
						variant="outline"
						color="gray"
						onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						size="2"
						onClick={handleContinue}>
						Continue
					</Button>
				</Flex>
			</Flex>
			<Flex
				direction="column"
				className="provider-setup__main"
				p="3">
				<Text
					size="2"
					className="provider-setup__main__title">
					{formTitle}
				</Text>
				<Flex
					className="provider-setup__main__form"
					width="100%"
					align="center"
					gap="3">
					<Text
						size="2"
						weight="medium"
						className="provider-setup__main__form__label">
						{formLabel}
					</Text>
					<TextField.Root
						size="3"
						variant="surface"
						className="provider-setup__main__form__input"
					/>
				</Flex>
				<Text
					size="2"
					weight="regular"
					className="provider-setup__main__footer">
					{formFooter}
				</Text>
			</Flex>
		</Flex>
	);
};

const ProviderConfigCancelButton = ({ onClick = NOOP }: { onClick?: () => void }) => {
	return (
		<IconButton
			className="provider-config-cancel-button"
			size="2"
			variant="soft"
			color="gray"
			onClick={onClick}>
			<Cross1Icon />
		</IconButton>
	);
};

const ProviderConfigKeyValue = () => {
	const [items, setItems] = useState<{ id: string; key: string; value: string }[]>([{ id: "1", key: "", value: "" }]);
	return (
		<Flex
			className="provider-config-key-value"
			direction="column"
			gap="2"
			p="3">
			{items.map((item) => (
				<Flex
					key={item.id}
					gap="4"
					className="provider-config-key-value__item"
					align="center"
					px="3"
					py="1">
					<Flex
						className="provider-config-key-value__item__key"
						align="center"
						gap="2">
						<Text
							size="2"
							weight="medium">
							Key
						</Text>
						<ProviderConfigInput />
					</Flex>
					<Flex
						className="provider-config-key-value__item__value"
						align="center"
						gap="2">
						<Text
							size="2"
							weight="medium">
							Value
						</Text>
						<ProviderConfigInput />
					</Flex>
					<ProviderConfigCancelButton onClick={() => setItems(items.filter((i) => i.id !== item.id))} />
				</Flex>
			))}
			<ProviderConfigButton
				label="Add New"
				onClick={() => setItems([...items, { id: crypto.randomUUID(), key: "", value: "" }])}
			/>
		</Flex>
	);
};

const ProviderConfigClient = ({ onDelete }: { onDelete: () => void }) => {
	return (
		<Flex
			direction="column"
			className="provider-configuration-client">
			<Flex
				justify="end"
				className="provider-configuration-client__delete"
				px="3"
				py="2">
				<IconButton
					variant="soft"
					color="gray"
					onClick={onDelete}>
					<TrashIcon />
				</IconButton>
			</Flex>
			<Flex
				direction="column"
				className="provider-configuration-client__details"
				p="3"
				gap="3">
				<ProviderConfigInputRow
					label="Client Id"
					required
					disabled={false}
					readonly={false}
				/>
				<ProviderConfigInputRow
					label="Client Secret"
					required
					disabled={false}
					readonly={false}
				/>
				<ProviderConfigInputRow
					label="Client Type"
					disabled={false}
					readonly={false}
				/>
			</Flex>
			<ProviderConfigSeparator />
			<Flex
				p="3"
				className="provider-configuration__form__clients__scopes">
				<ProviderConfigScopeInput disabled={false} />
			</Flex>
			<Flex
				direction="column"
				gap="2"
				p="3">
				<ProviderConfigInputLabel
					label="Additional Configuration"
					withIcon={false}
				/>
				<ProviderConfigKeyValue />
			</Flex>
			<Flex
				p="3"
				gap="2"
				className="provider-configuration__form__clients__force-pkce">
				<ProviderConfigInputLabel label="Force PKCE" />
				<Switch />
			</Flex>
		</Flex>
	);
};

const ProviderConfigClients = () => {
	const [clients, setClients] = useState<string[]>(["test"]);

	return (
		<Flex
			direction="column"
			gap="3"
			p="3"
			className="provider-configuration-clients">
			{clients.map((client) => (
				<ProviderConfigClient
					key={client}
					onDelete={() => setClients(clients.filter((c) => c !== client))}
				/>
			))}
			<Box>
				<Button
					onClick={() => setClients([...clients, crypto.randomUUID()])}
					variant="soft"
					size="2">
					<PlusIcon />
					Add New Client
				</Button>
			</Box>
		</Flex>
	);
};
const ProviderConfigSuffixInput = ({
	label,
	suffix,
	disabled,
}: {
	label: string;
	suffix?: string;
	disabled?: boolean;
}) => {
	const [suffixValue, setSuffixValue] = useState(suffix);

	return (
		<Flex
			align="center"
			className={`provider-config-suffix-input ${
				suffixValue !== undefined ? "provider-config-suffix-input--active" : ""
			}`}
			width="100%">
			<Button
				size="3"
				variant="surface"
				disabled
				className="provider-config-suffix-input__button">
				<Text
					size="3"
					className="provider-config-suffix-input__button__text">
					{label}-
				</Text>
			</Button>

			{suffixValue === undefined ? (
				<Flex
					align="center"
					ml="2"
					className="provider-config-suffix-input__add-suffix">
					<PlusIcon />
					<Text
						size="2"
						weight="medium"
						onClick={() => setSuffixValue("test")}
						className="provider-config-suffix-input__add-suffix__text">
						Add Suffix
					</Text>
					<Tooltip
						content={
							<Text size="2">
								You can add multiple providers of the same type by adding a unique suffix to the third
								party id.
							</Text>
						}
						side="right">
						<QuestionMarkCircledIcon />
					</Tooltip>
				</Flex>
			) : (
				<ProviderConfigInput disabled={disabled} />
			)}
		</Flex>
	);
};

const ProviderConfigThirdParty = ({ withSuffix = false }: { withSuffix?: boolean }) => {
	return (
		<Flex
			className="provider-configuration__form__thirdparty"
			direction="column"
			gap="3">
			{withSuffix ? (
				<Flex
					align="center"
					gap="2">
					<ProviderConfigInputLabel
						label="Third Party ID"
						required
					/>
					<ProviderConfigSuffixInput
						label="github"
						disabled={false}
					/>
				</Flex>
			) : (
				<ProviderConfigInputRow
					label="Third Party ID"
					withIcon
					disabled={false}
					readonly={false}
				/>
			)}

			<ProviderConfigInputRow
				label="Name"
				withIcon
				disabled={false}
				readonly={false}
			/>
		</Flex>
	);
};

const ProviderConfigActions = ({
	isEditing,
	setIsEditing,
}: {
	isEditing: boolean;
	setIsEditing: (isEditing: boolean) => void;
}) => {
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	return (
		<>
			{isEditing ? (
				<Flex
					align="center"
					gap="2">
					<Button
						variant="outline"
						color="gray"
						size="2"
						onClick={() => setIsEditing(false)}>
						Cancel
					</Button>
					<Button size="2">Save</Button>
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
					<DeleteProviderConfigModal
						open={isDeleteModalOpen}
						handleClose={() => setIsDeleteModalOpen(false)}
					/>
				</Flex>
			)}
		</>
	);
};

export const ProviderConfiguration = () => {
	const [isEditing, setIsEditing] = useState(false);
	return (
		<Flex
			width="100%"
			direction="column"
			className="provider-configuration">
			<Flex
				className="provider-configuration__header"
				justify="between"
				align="center">
				<Flex
					align="center"
					gap="3"
					className="provider-configuration__header__main">
					<ItemLabel
						size="2"
						className="provider-configuration__header__main__label">
						Provider Configuration
					</ItemLabel>
					<Badge
						size="2"
						variant="soft"
						color="gray"
						className="provider-configuration__header__main__badge">
						<img
							src={getImageUrl("google.png")}
							alt="Google"
							width="16px"
							height="16px"
						/>
						<Text
							size="2"
							weight="medium"
							className="provider-configuration__header__main__badge__text">
							Google
						</Text>
					</Badge>
				</Flex>
				<ProviderConfigActions
					isEditing={isEditing}
					setIsEditing={setIsEditing}
				/>
			</Flex>
			<Flex
				className="provider-configuration__form"
				width="100%"
				direction="column">
				<ProviderConfigThirdParty />
				<Flex
					direction="column"
					className="provider-configuration__form__clients">
					<Flex className="provider-configuration__form__clients__header">Clients</Flex>
					<ProviderConfigClients />
				</Flex>
				<ProviderConfigSeparator />

				<Flex
					direction="column"
					p="3"
					gap="3">
					<ProviderConfigInputRow
						label="OIDC Discovery Endpoint"
						size="md"
					/>
					<ProviderConfigInputRow
						label="Authorization Endpoint"
						size="md"
					/>

					<Flex
						direction="column"
						gap="3">
						<ProviderConfigInputLabel label="Authorization Endpoint Query Params" />
						<ProviderConfigKeyValue />
					</Flex>
					<ProviderConfigInputRow label="Token Endpoint" />
					<Flex
						direction="column"
						gap="3">
						<ProviderConfigInputLabel label="Token Endpoint Body Params" />
						<ProviderConfigKeyValue />
					</Flex>
					<ProviderConfigSeparator mx="0" />
					<ProviderConfigInputRow label="User Info Endpoint" />
					<Flex
						direction="column"
						gap="3">
						<ProviderConfigInputLabel label="User Info Endpoint Query Params" />
						<ProviderConfigKeyValue />
					</Flex>
					<ProviderConfigInputRow label="User Info Endpoint Headers" />
					<Flex
						direction="column"
						gap="3">
						<ProviderConfigInputLabel label="User Info Endpoint Headers" />
						<ProviderConfigKeyValue />
					</Flex>
					<Flex gap="3">
						<ProviderConfigInputLabel label="How often does the provider return email?" />
						<SegmentedControl.Root
							defaultValue="inbox"
							className="provider-config-segmented-control"
							variant="surface"
							size="3">
							<SegmentedControl.Item value="inbox">All the time</SegmentedControl.Item>
							<SegmentedControl.Item value="drafts">Sometimes</SegmentedControl.Item>
							<SegmentedControl.Item value="sent">Never</SegmentedControl.Item>
						</SegmentedControl.Root>
					</Flex>
					<Flex
						direction="column"
						gap="3">
						<ProviderConfigInputLabel label="User Info Map from UserInfo API" />
						<Flex
							direction="column"
							gap="3"
							p="3"
							className="provider-configuration__form__user-info">
							<ProviderConfigInputRow
								label="userId"
								withIcon={false}
							/>
							<ProviderConfigInputRow
								label="email"
								withIcon={false}
							/>
							<ProviderConfigInputRow
								label="emailVerified"
								withIcon={false}
							/>
						</Flex>
					</Flex>
					<Flex
						direction="column"
						gap="3">
						<ProviderConfigInputLabel label="User Info Map from Id Token Payload" />
						<Flex
							p="3"
							gap="3"
							direction="column"
							className="provider-configuration__form__user-info">
							<ProviderConfigInputRow
								label="userId"
								withIcon={false}
							/>
							<ProviderConfigInputRow
								label="email"
								withIcon={false}
							/>
							<ProviderConfigInputRow
								label="emailVerified"
								withIcon={false}
							/>
						</Flex>
					</Flex>
					<ProviderConfigSeparator mx="0" />
					<ProviderConfigInputRow label="JWKS URI" />
				</Flex>
			</Flex>
			<Flex
				justify="end"
				m="3">
				{isEditing && (
					<ProviderConfigActions
						isEditing={isEditing}
						setIsEditing={setIsEditing}
					/>
				)}
			</Flex>
		</Flex>
	);
};

const ProvidersContent = ({
	tenantId,
	providers,
}: {
	tenantId: string;
	providers: { thirdPartyId: string; name: string }[];
}) => {
	const [isNewProviderModalOpen, setIsNewProviderModalOpen] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState<string | undefined>(
		providers.length > 0 ? providers[0].thirdPartyId : undefined
	);

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
				/>
			</TabSelector.ContentHeading>
			{providers.length > 0 && (
				<>
					<Flex
						px="4"
						py="3"
						gap="4"
						className="providers-content__active-providers">
						{providers.map((provider) => (
							<ProviderButton
								key={provider.thirdPartyId}
								icon={`${provider.thirdPartyId}.png`}
								label={provider.name}
								isActive={selectedProvider === provider.thirdPartyId}
							/>
						))}
					</Flex>
					{selectedProvider && (
						<Box
							m="4"
							className="providers-content__form">
							<ProviderConfiguration />
						</Box>
					)}
				</>
			)}
		</Flex>
	);
};

export const Providers = ({
	tenantId,
	tenantInfo,
}: {
	tenantId: string;
	tenantInfo: { thirdParty: { providers: { thirdPartyId: string; name: string }[] } };
}) => {
	const [state] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");
	switch (state) {
		case "LOADING":
			return (
				<Flex
					width="100%"
					p="3">
					<Loader type="list" />
				</Flex>
			);
		case "SUCCESS":
			return (
				<ProvidersContent
					tenantId={tenantId}
					providers={tenantInfo.thirdParty.providers}
				/>
			);
		case "ERROR":
			return <DashboardError />;
		default:
			return assertNever(state);
	}
};
