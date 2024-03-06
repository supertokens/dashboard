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
import { useThirdPartyService } from "../../../../../api/tenants";
import { ProviderClientConfig, ProviderConfig } from "../../../../../api/tenants/types";
import { getImageUrl, isValidHttpUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { Toggle } from "../../../toggle/Toggle";
import { DeleteThirdPartyProviderDialog } from "../deleteThirdPartyProvider/DeleteThirdPartyProvider";
import { KeyValueInput } from "../keyValueInput/KeyValueInput";
import { useTenantDetailContext } from "../TenantDetailContext";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import {
	ThirdPartyProviderInput,
	ThirdPartyProviderInputLabel,
} from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import { ClientConfig } from "./ClientConfig";
import "./thirdPartyProviderConfig.scss";

export const CustomProviderInfo = ({
	providerId,
	providerConfig,
	handleGoBack,
	isAddingNewProvider,
}: {
	providerId?: string;
	providerConfig?: ProviderConfig;
	handleGoBack: (shouldGoBackToDetailPage?: boolean) => void;
	isAddingNewProvider: boolean;
}) => {
	const [providerConfigState, setProviderConfigState] = useState(getInitialProviderInfo(providerConfig));
	const [errorState, setErrorState] = useState<Record<string, string>>({});
	const [isDeleteProviderDialogOpen, setIsDeleteProviderDialogOpen] = useState(false);
	const { resolvedProviders, refetchTenant, tenantInfo } = useTenantDetailContext();
	const [isSaving, setIsSaving] = useState(false);
	const { showToast } = useContext(PopupContentContext);
	const { createOrUpdateThirdPartyProvider } = useThirdPartyService();

	const handleAddNewClient = () => {
		setProviderConfigState((prev) => ({
			...prev,
			clients: [...(prev?.clients ?? []), { clientId: "", clientSecret: "", scope: [""] }],
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

	const handleSave = async () => {
		setErrorState({});
		const clientTypes = new Set<string>();
		let isValid = true;
		const doesThirdPartyIdExist = resolvedProviders.some(
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
			setErrorState((prev) => ({ ...prev, thirdPartyId: "Third Party Id already exists" }));
			isValid = false;
		}

		if (typeof providerConfigState.name !== "string" || providerConfigState.name.trim() === "") {
			setErrorState((prev) => ({ ...prev, name: "Name is required" }));
			isValid = false;
		}

		providerConfigState.clients?.forEach((client, index) => {
			if (typeof client.clientId !== "string" || client.clientId.trim() === "") {
				setErrorState((prev) => ({ ...prev, [`clients.${index}.clientId`]: "Client Id is required" }));
				isValid = false;
			}
			if (typeof client.clientSecret !== "string" || client.clientSecret.trim() === "") {
				setErrorState((prev) => ({
					...prev,
					[`clients.${index}.clientSecret`]: "Client Secret is required",
				}));
				isValid = false;
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

		if (
			isValid &&
			(providerConfigState.oidcDiscoveryEndpoint?.trim().length === 0
				? providerConfigState.authorizationEndpoint?.trim().length === 0 ||
				  providerConfigState.tokenEndpoint?.trim().length === 0 ||
				  providerConfigState.userInfoEndpoint?.trim().length === 0
				: false)
		) {
			// Show error for remaining fields if one of the authorization, token or user info
			// endpoints are filled but rest are empty
			if (
				providerConfigState.authorizationEndpoint?.trim().length > 0 ||
				providerConfigState.tokenEndpoint?.trim().length > 0 ||
				providerConfigState.userInfoEndpoint?.trim().length > 0
			) {
				setErrorState((prev) => ({
					...prev,
					authorizationEndpoint:
						providerConfigState.authorizationEndpoint?.trim().length === 0
							? "Authorization Endpoint is required"
							: "",
					tokenEndpoint:
						providerConfigState.tokenEndpoint?.trim().length === 0 ? "Token Endpoint is required" : "",
					userInfoEndpoint:
						providerConfigState.userInfoEndpoint?.trim().length === 0
							? "User Info Endpoint is required"
							: "",
				}));
			} else {
				setErrorState((prev) => ({
					...prev,
					oidcDiscoveryEndpoint:
						"Either OIDC Discovery Endpoint or Authorization, Token and User Info Endpoints are required",
				}));
			}
			isValid = false;
		}

		if (!isValid) {
			return;
		}

		const normalizedProviderConfigClients = providerConfigState.clients?.map((client) => {
			const normalizedScopes = client.scope?.filter((scope) => scope && scope?.trim() !== "") ?? [];
			return { ...client, scope: normalizedScopes.length === 0 ? null : normalizedScopes };
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
		}
	};

	return (
		<PanelRoot>
			<PanelHeader>
				<div className="built-in-provider-config-header">
					<PanelHeaderTitleWithTooltip>Custom Provider Configuration</PanelHeaderTitleWithTooltip>
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
				<ThirdPartyProviderInput
					label="Name"
					tooltip="The name of the provider."
					type="text"
					name="name"
					error={errorState.name}
					forceShowError
					value={providerConfigState.name}
					isRequired
					minLabelWidth={120}
					handleChange={handleFieldChange}
				/>
				<div className="custom-provider-divider" />
				<div className="custom-provider-client-config">
					<div className="custom-provider-client-config__header">Clients</div>
					{providerConfigState.clients?.map((client, index) => (
						<ClientConfig
							key={index}
							providerId={providerConfigState.thirdPartyId}
							clientsCount={providerConfigState.clients?.length ?? 0}
							client={client}
							clientIndex={index}
							errors={errorState}
							setClient={(client: ProviderClientConfig) => {
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
					error={errorState.authorizationEndpoint}
					forceShowError
					name="authorizationEndpoint"
					value={providerConfigState.authorizationEndpoint}
					handleChange={handleFieldChange}
				/>
				<KeyValueInput
					label="Authorization Endpoint Query Params"
					name="authorizationEndpointQueryParams"
					tooltip="The query params to be sent to the authorization endpoint."
					value={providerConfigState.authorizationEndpointQueryParams}
					onChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, authorizationEndpointQueryParams: value }));
					}}
				/>
				<div className="custom-provider-divider" />
				<ThirdPartyProviderInput
					label="Token Endpoint"
					tooltip="The token endpoint of the provider."
					type="text"
					name="tokenEndpoint"
					error={errorState.tokenEndpoint}
					forceShowError
					value={providerConfigState.tokenEndpoint}
					handleChange={handleFieldChange}
				/>
				<KeyValueInput
					label="Token Endpoint Body Params"
					name="tokenEndpointBodyParams"
					tooltip="The body params to be sent to the token endpoint."
					value={providerConfigState.tokenEndpointBodyParams}
					onChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, tokenEndpointBodyParams: value }));
					}}
				/>
				<div className="custom-provider-divider" />

				<ThirdPartyProviderInput
					label="User Info Endpoint"
					tooltip="The user info endpoint of the provider."
					type="text"
					name="userInfoEndpoint"
					error={errorState.userInfoEndpoint}
					forceShowError
					value={providerConfigState.userInfoEndpoint}
					handleChange={handleFieldChange}
				/>

				<KeyValueInput
					label="User Info Endpoint Query Params"
					name="userInfoEndpointQueryParams"
					tooltip="The query params to be sent to the user info endpoint."
					value={providerConfigState.userInfoEndpointQueryParams}
					onChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, userInfoEndpointQueryParams: value }));
					}}
				/>

				<KeyValueInput
					label="User Info Endpoint Headers"
					name="userInfoEndpointHeaders"
					tooltip="The headers to be sent to the user info endpoint."
					value={providerConfigState.userInfoEndpointHeaders}
					onChange={(value) => {
						setProviderConfigState((prev) => ({ ...prev, userInfoEndpointHeaders: value }));
					}}
				/>

				<UserInfoMap
					label="User Info Map from UserInfo API"
					tooltip="The mapping of the user info fields to the user info API."
					name="fromUserInfoAPI"
					value={
						providerConfigState.userInfoMap.fromUserInfoAPI ?? { userId: "", email: "", emailVerified: "" }
					}
					handleChange={handleUserInfoFieldChange}
				/>

				<UserInfoMap
					label="User Info Map from Id Token Payload"
					tooltip="The mapping of the user info fields to the id token payload."
					name="fromIdTokenPayload"
					value={
						providerConfigState.userInfoMap.fromIdTokenPayload ?? {
							userId: "",
							email: "",
							emailVerified: "",
						}
					}
					handleChange={handleUserInfoFieldChange}
				/>

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

				<div className="fields-container__toggle-container">
					<ThirdPartyProviderInputLabel
						label="Require Email"
						tooltip="Whether the email is required or not."
					/>
					<Toggle
						id="requireEmail"
						checked={providerConfigState.requireEmail}
						onChange={(e) => {
							setProviderConfigState((prev) => ({ ...prev, requireEmail: e.target.checked }));
						}}
					/>
				</div>
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
					value={value.userId}
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
					minLabelWidth={130}
					value={value.email}
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
					minLabelWidth={130}
					value={value.emailVerified}
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

type ProviderConfigState = Omit<
	Required<ProviderConfig>,
	| "tokenEndpointBodyParams"
	| "authorizationEndpointQueryParams"
	| "userInfoEndpointHeaders"
	| "userInfoEndpointQueryParams"
> & {
	tokenEndpointBodyParams: Array<[string, string | null]>;
	authorizationEndpointQueryParams: Array<[string, string | null]>;
	userInfoEndpointHeaders: Array<[string, string | null]>;
	userInfoEndpointQueryParams: Array<[string, string | null]>;
};

const getInitialProviderInfo = (providerConfig: ProviderConfig | undefined): ProviderConfigState => {
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
			clients: providerConfig.clients ?? [],
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
		clients: [{ clientId: "", clientSecret: "", scope: [""] }],
	};
};
