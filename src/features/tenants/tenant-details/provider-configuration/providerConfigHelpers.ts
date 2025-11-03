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

import type { ProviderConfig, ProviderConfigResponse, ProviderClientConfig } from "@api/tenants/types";
import { IN_BUILT_THIRD_PARTY_PROVIDERS, SAML_PROVIDER_ID } from "@shared/constants";
import { IN_BUILT_PROVIDERS_CUSTOM_FIELDS_FOR_CLIENT } from "@features/tenants/constants/providers";

export type ProviderClientState = Omit<ProviderClientConfig, "additionalConfig" | "scope"> & {
	additionalConfig: [string, string | null][];
	scope: string[];
	key: string;
};

export type ProviderConfigState = Omit<
	Required<ProviderConfig>,
	| "tokenEndpointBodyParams"
	| "authorizationEndpointQueryParams"
	| "userInfoEndpointHeaders"
	| "userInfoEndpointQueryParams"
	| "clients"
> & {
	tokenEndpointBodyParams: [string, string | null][];
	authorizationEndpointQueryParams: [string, string | null][];
	userInfoEndpointHeaders: [string, string | null][];
	userInfoEndpointQueryParams: [string, string | null][];
	clients: ProviderClientState[];
};

export const isKnownThirdPartyId = (thirdPartyId: string): boolean => {
	if (thirdPartyId.startsWith(SAML_PROVIDER_ID)) return true;
	return IN_BUILT_THIRD_PARTY_PROVIDERS.some((provider) => thirdPartyId.startsWith(provider.id));
};

export const getInitialProviderState = (
	providerConfig: ProviderConfigResponse | undefined,
	providerId?: string
): ProviderConfigState => {
	const customFieldProviderKey = Object.keys(IN_BUILT_PROVIDERS_CUSTOM_FIELDS_FOR_CLIENT).find((id) =>
		providerId?.startsWith(id)
	);
	const customFields = customFieldProviderKey
		? IN_BUILT_PROVIDERS_CUSTOM_FIELDS_FOR_CLIENT[customFieldProviderKey]
		: [];

	let additionalConfigFields: [string, string][] = customFields.map((field) => [field.id, ""]);

	if (additionalConfigFields.length === 0) {
		additionalConfigFields = [["", ""]];
	}

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
							clientType: client.clientType ?? "",
							clientSecret: client.clientSecret ?? "",
							scope: Array.isArray(client.scope) && client.scope.length > 0 ? client.scope : [""],
							additionalConfig:
								client.additionalConfig && Object.keys(client.additionalConfig).length > 0
									? Object.entries(client.additionalConfig)
									: additionalConfigFields,
							key: crypto.randomUUID(),
					  }))
					: [
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
		thirdPartyId: providerId ?? "",
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
				additionalConfig: additionalConfigFields,
				forcePKCE: false,
				key: crypto.randomUUID(),
			},
		],
	};
};

export const normalizeProviderConfig = (state: ProviderConfigState): ProviderConfig => {
	const normalizedClients = state.clients?.map((client) => {
		let normalizedScopes: string[] | undefined =
			client.scope?.filter((scope) => scope && scope?.trim() !== "") ?? [];
		if (normalizedScopes.length === 0) {
			normalizedScopes = undefined;
		}
		return {
			clientId: client.clientId.trim(),
			clientType: client.clientType?.trim() || undefined,
			clientSecret: client.clientSecret?.trim() || undefined,
			scope: normalizedScopes,
			additionalConfig: Object.fromEntries(
				client.additionalConfig.filter(
					([key, value]: [string, string | null]) => key.trim().length > 0 && value !== null
				)
			),
			forcePKCE: client.forcePKCE,
		};
	});

	const normalizedAuthorizationEndpointQueryParams = Object.fromEntries(
		state.authorizationEndpointQueryParams.filter(
			([key, value]: [string, string | null]) =>
				typeof key === "string" && key.trim().length > 0 && value !== null
		)
	) as { [key: string]: string };

	const normalizedTokenEndpointBodyParams = Object.fromEntries(
		state.tokenEndpointBodyParams.filter(
			([key, value]: [string, string | null]) =>
				typeof key === "string" && key.trim().length > 0 && value !== null
		)
	) as { [key: string]: string };

	const normalizedUserInfoEndpointQueryParams = Object.fromEntries(
		state.userInfoEndpointQueryParams.filter(
			([key, value]: [string, string | null]) =>
				typeof key === "string" && key.trim().length > 0 && value !== null
		)
	) as { [key: string]: string };

	const normalizedUserInfoEndpointHeaders = Object.fromEntries(
		state.userInfoEndpointHeaders.filter(
			([key, value]: [string, string | null]) =>
				typeof key === "string" && key.trim().length > 0 && value !== null
		)
	) as { [key: string]: string };

	return {
		thirdPartyId: state.thirdPartyId,
		name: state.name.trim() || undefined,
		oidcDiscoveryEndpoint: state.oidcDiscoveryEndpoint.trim() || undefined,
		tokenEndpoint: state.tokenEndpoint.trim() || undefined,
		userInfoEndpoint: state.userInfoEndpoint.trim() || undefined,
		authorizationEndpoint: state.authorizationEndpoint.trim() || undefined,
		jwksURI: state.jwksURI.trim() || undefined,
		requireEmail: state.requireEmail,
		clients: normalizedClients,
		userInfoMap: {
			fromIdTokenPayload: {
				userId: state.userInfoMap.fromIdTokenPayload?.userId?.trim() || undefined,
				email: state.userInfoMap.fromIdTokenPayload?.email?.trim() || undefined,
				emailVerified: state.userInfoMap.fromIdTokenPayload?.emailVerified?.trim() || undefined,
			},
			fromUserInfoAPI: {
				userId: state.userInfoMap.fromUserInfoAPI?.userId?.trim() || undefined,
				email: state.userInfoMap.fromUserInfoAPI?.email?.trim() || undefined,
				emailVerified: state.userInfoMap.fromUserInfoAPI?.emailVerified?.trim() || undefined,
			},
		},
		authorizationEndpointQueryParams: normalizedAuthorizationEndpointQueryParams,
		tokenEndpointBodyParams: normalizedTokenEndpointBodyParams,
		userInfoEndpointQueryParams: normalizedUserInfoEndpointQueryParams,
		userInfoEndpointHeaders: normalizedUserInfoEndpointHeaders,
	};
};
