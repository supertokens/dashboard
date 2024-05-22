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
import { ProviderClientState, ProviderCustomField } from "../../../../../api/tenants/types";
import { ReactComponent as TrashIcon } from "../../../../../assets/trash.svg";
import { DeleteCrossButton } from "../../../deleteCrossButton/DeleteCrossButton";
import { Toggle } from "../../../toggle/Toggle";
import { DeleteClientDialog } from "../deleteThirdPartyClient/DeleteThirdPartyClient";
import { KeyValueInput } from "../keyValueInput/KeyValueInput";
import {
	ThirdPartyProviderInput,
	ThirdPartyProviderInputLabel,
} from "../thirdPartyProviderInput/ThirdPartyProviderInput";
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
	client: ProviderClientState;
	clientsCount: number;
	setClient: (client: ProviderClientState) => void;
	additionalConfigFields?: ProviderCustomField[];
	handleDeleteClient: () => void;
	clientIndex: number;
	errors: Record<string, string>;
}) => {
	const isAppleProvider = providerId.startsWith("apple");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const handleClientFieldChange = (
		name: string,
		e: ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
	) => {
		if (e.type === "change") {
			setClient({ ...client, [name]: e.target.value });
		}
	};

	const handleAdditionalConfigChange = (
		key: string,
		e: ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
	) => {
		const newAdditionalConfig: [string, string | null][] = client.additionalConfig.map(([k, v]) => {
			if (k === key) {
				return [k, e.target.value];
			}
			return [k, v];
		});
		setClient({ ...client, additionalConfig: newAdditionalConfig });
	};

	const handleScopesChange = (scopes: string[]) => {
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
						name={`clientId-${clientIndex}`}
						value={client.clientId}
						minLabelWidth={LABEL_MIN_WIDTH}
						error={errors[`clients.${clientIndex}.clientId`]}
						forceShowError
						handleChange={(e) => handleClientFieldChange("clientId", e)}
					/>
					{/* In case of Apple we don't ask for client secret */}
					{!isAppleProvider && (
						<ThirdPartyProviderInput
							label="Client Secret"
							isRequired
							tooltip="The client secret of the provider."
							type="password"
							name={`clientSecret-${clientIndex}`}
							value={client.clientSecret}
							minLabelWidth={LABEL_MIN_WIDTH}
							error={errors[`clients.${clientIndex}.clientSecret`]}
							forceShowError
							handleChange={(e) => handleClientFieldChange("clientSecret", e)}
						/>
					)}
					{additionalConfigFields?.map((field) => (
						<ThirdPartyProviderInput
							key={field.id}
							label={field.label}
							tooltip={field.tooltip}
							type={field.type}
							name={`${field.id}-${clientIndex}`}
							value={client?.additionalConfig?.find(([key]) => key === field.id)?.[1] ?? ""}
							isRequired={field.required}
							minLabelWidth={LABEL_MIN_WIDTH}
							error={errors[`clients.${clientIndex}.additionalConfig.${field.id}`]}
							forceShowError
							handleChange={(e) => handleAdditionalConfigChange(field.id, e)}
						/>
					))}
					<ThirdPartyProviderInput
						label="Client Type"
						isRequired={clientsCount > 1}
						tooltip="Client type is useful when you have multiple clients for the same provider, for different client types like web, mobile, etc."
						type="text"
						name={`clientType-${clientIndex}`}
						value={client.clientType}
						minLabelWidth={LABEL_MIN_WIDTH}
						error={errors[`clients.${clientIndex}.clientType`]}
						forceShowError
						handleChange={(e) => handleClientFieldChange("clientType", e)}
					/>
				</div>
				<hr className="client-config-container__divider" />
				<div className="client-config-container__advanced-settings">
					<Scopes
						scopes={client.scope ?? [""]}
						setScopes={handleScopesChange}
					/>
					<KeyValueInput
						label="Additional Config"
						name="additionalConfig"
						fixedFields={additionalConfigFields?.map((field) => field.id) ?? []}
						tooltip="Additional configuration for the provider for this client."
						value={client.additionalConfig}
						onChange={(value) => {
							setClient({ ...client, additionalConfig: value });
						}}
					/>
					<div className="fields-container__toggle-container">
						<ThirdPartyProviderInputLabel
							label="Force PKCE"
							tooltip="Enable this if you want to force PKCE flow for this client."
						/>
						<Toggle
							id="forcePKCE"
							checked={client.forcePKCE ?? false}
							onChange={(e) => {
								setClient({ ...client, forcePKCE: e.target.checked });
							}}
						/>
					</div>
				</div>
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
				{(scopes.length > 1 || scopes[0]?.length > 0) && (
					<DeleteCrossButton
						onClick={() => {
							if (scopes.length > 1) {
								setScopes(scopes.filter((_, i) => i !== 0));
							} else {
								setScopes([""]);
							}
						}}
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
					<DeleteCrossButton
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
