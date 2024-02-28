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
import { ChangeEvent, useState } from "react";
import { ProviderClientConfig, ProviderCustomField } from "../../../../../api/tenants/types";
import { ReactComponent as ChevronDown } from "../../../../../assets/chevron-down.svg";
import { ReactComponent as CloseIconActive } from "../../../../../assets/close-active.svg";
import { ReactComponent as CloseIconDefault } from "../../../../../assets/close-inactive.svg";
import { ReactComponent as TrashIcon } from "../../../../../assets/trash.svg";
import { CollapsibleContent, CollapsibleFixed, CollapsibleRoot } from "../../../collapsible/Collapsible";
import { DeleteClientDialog } from "../deleteThirdPartyClient/DeleteThirdPartyClient";
import { ThirdPartyProviderInput } from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import "./thirdPartyProviderConfig.scss";

const LABEL_MIN_WIDTH = 130;

export const ClientConfig = ({
	providerId,
	client,
	clientsCount,
	setClient,
	additionalConfigFields,
	handleDeleteClient,
	clientIndex,
	errors,
}: {
	providerId: string;
	client: ProviderClientConfig;
	clientsCount: number;
	setClient: (client: ProviderClientConfig) => void;
	additionalConfigFields?: Array<ProviderCustomField>;
	handleDeleteClient: () => void;
	clientIndex: number;
	errors: Record<string, string>;
}) => {
	const isAppleProvider = providerId.startsWith("apple");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const handleClientFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.type === "change") {
			setClient({ ...client, [e.target.name]: e.target.value });
		}
	};

	const handleAdditionalConfigChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.type === "change") {
			setClient({ ...client, additionalConfig: { ...client.additionalConfig, [e.target.name]: e.target.value } });
		}
	};

	const handleScopesChange = (scopes: Array<string>) => {
		setClient({ ...client, scope: scopes });
	};

	return (
		<div className="client-config-container">
			<div className="client-config-container__header">
				{clientsCount > 1 && (
					<button
						onClick={() => setIsDeleteDialogOpen(true)}
						aria-label="Delete Client"
						className="client-config-container__delete-client">
						<TrashIcon />
					</button>
				)}
			</div>
			<div className="client-config-container__fields-container">
				<div className="client-config-container__fields">
					<ThirdPartyProviderInput
						label="Client Id"
						isRequired
						tooltip="The client ID of the provider."
						type="text"
						name="clientId"
						value={client.clientId}
						minLabelWidth={LABEL_MIN_WIDTH}
						error={errors[`clients.${clientIndex}.clientId`]}
						forceShowError
						handleChange={handleClientFieldChange}
					/>
					{/* In case of Apple the additionalConfig fields are displayed in
                    the main section. */}
					{isAppleProvider ? (
						additionalConfigFields?.map((field) => (
							<ThirdPartyProviderInput
								key={field.id}
								label={field.label}
								tooltip={field.tooltip}
								type={field.type}
								name={field.id}
								value={(client?.additionalConfig?.[field.id] as string | undefined) ?? ""}
								isRequired={field.required}
								minLabelWidth={LABEL_MIN_WIDTH}
								error={errors[`clients.${clientIndex}.additionalConfig.${field.id}`]}
								forceShowError
								handleChange={handleAdditionalConfigChange}
							/>
						))
					) : (
						<ThirdPartyProviderInput
							label="Client Secret"
							isRequired
							tooltip="The client ID of the provider."
							type="password"
							name="clientSecret"
							value={client.clientSecret}
							minLabelWidth={LABEL_MIN_WIDTH}
							error={errors[`clients.${clientIndex}.clientSecret`]}
							forceShowError
							handleChange={handleClientFieldChange}
						/>
					)}
					<ThirdPartyProviderInput
						label="Client Type"
						isRequired={clientsCount > 1}
						tooltip="Client type is useful when you have multiple clients for the same provider, for different client types like web, mobile, etc."
						type="text"
						name="clientType"
						value={client.clientType}
						minLabelWidth={LABEL_MIN_WIDTH}
						error={errors[`clients.${clientIndex}.clientType`]}
						forceShowError
						handleChange={handleClientFieldChange}
					/>
				</div>
				<hr className="client-config-container__divider" />
				<CollapsibleRoot>
					<CollapsibleFixed>
						{({ isCollapsed, setIsCollapsed }) => (
							<div className="client-config-container__advanced-settings-header">
								<h2 className="client-config-container__advanced-settings-title">Advanced Settings</h2>
								<button
									aria-label="Toggle Settings"
									className={`client-config-container__advanced-settings-toggle ${
										!isCollapsed ? "client-config-container__advanced-settings-toggle--open" : ""
									}`}
									onClick={() => setIsCollapsed(!isCollapsed)}>
									<ChevronDown />
								</button>
							</div>
						)}
					</CollapsibleFixed>

					<CollapsibleContent>
						<div className="client-config-container__advanced-settings">
							<Scopes
								scopes={client.scope ?? [""]}
								setScopes={handleScopesChange}
							/>
							{/* Additional config fields are displayed in the main section for Apple provider. */}
							{!isAppleProvider &&
								additionalConfigFields?.map((field) => (
									<ThirdPartyProviderInput
										key={field.id}
										label={field.label}
										tooltip={field.tooltip}
										type={field.type}
										name={field.id}
										value={(client?.additionalConfig?.[field.id] as string | undefined) ?? ""}
										isRequired={field.required}
										minLabelWidth={LABEL_MIN_WIDTH}
										error={errors[`clients.${clientIndex}.additionalConfig.${field.id}`]}
										forceShowError
										handleChange={handleAdditionalConfigChange}
									/>
								))}
						</div>
					</CollapsibleContent>
				</CollapsibleRoot>
			</div>
			{isDeleteDialogOpen && (
				<DeleteClientDialog
					onCloseDialog={() => setIsDeleteDialogOpen(false)}
					handleDeleteClient={handleDeleteClient}
					clientType={client.clientType}
				/>
			)}
		</div>
	);
};

const Scopes = ({ scopes, setScopes }: { scopes: string[]; setScopes: (scopes: string[]) => void }) => {
	return (
		<div className="scopes-container">
			<div className="scopes-container__input-container">
				<ThirdPartyProviderInput
					label="Scopes"
					tooltip="The scopes required by the third-party provider."
					type="text"
					name="scopes"
					value={scopes[0] ?? ""}
					handleChange={(e) => {
						const newScopes = [...scopes];
						newScopes[0] = e.target.value;
						setScopes(newScopes);
					}}
					minLabelWidth={108}
				/>
				{scopes.length > 1 && (
					<DeleteScopeButton
						onClick={() => setScopes(scopes.filter((_, i) => i !== 0))}
						label="Delete Scope"
					/>
				)}
			</div>
			{scopes?.slice(1).map((scope, index) => (
				<div
					className="scopes-container__input-container"
					key={index}>
					<ThirdPartyProviderInput
						label=""
						name={`scope-${index}`}
						type="text"
						value={scope}
						handleChange={(e) => {
							const newScopes = [...scopes];
							newScopes[index + 1] = e.target.value;
							setScopes(newScopes);
						}}
						minLabelWidth={108}
					/>
					<DeleteScopeButton
						onClick={() => setScopes(scopes.filter((_, i) => i !== index + 1))}
						label="Delete Scope"
					/>
				</div>
			))}
			<div className="scopes-container__footer">
				<hr className="scopes-container__divider" />
				<button
					className="scopes-container__add-new"
					onClick={() => setScopes([...scopes, ""])}>
					+ Add new
				</button>
			</div>
		</div>
	);
};

const DeleteScopeButton = ({ onClick, label }: { onClick: () => void; label: string }) => {
	const [isHovered, setIsHovered] = useState(false);
	return (
		<button
			className="delete-scope-button"
			onClick={onClick}
			aria-label={label}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}>
			{isHovered ? <CloseIconActive /> : <CloseIconDefault />}
		</button>
	);
};
