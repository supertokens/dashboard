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

import { isValidHttpUrl } from "@shared/utils";
import type { ProviderCustomField } from "@api/tenants/types";

import type { ProviderClientState, ProviderConfigState } from "./providerConfigHelpers";
import { isKnownThirdPartyId } from "./providerConfigHelpers";

type ValidationErrors = Record<string, string>;

const THIRD_PARTY_ID_REGEX = /^[a-z0-9-]+$/;

const ERROR_MESSAGES = {
	THIRD_PARTY_ID_REQUIRED: "Third Party Id is required",
	THIRD_PARTY_ID_FORMAT: "Third Party Id can only contain lowercase alphabets, numbers and hyphens",
	THIRD_PARTY_ID_DUPLICATE:
		"Another provider with this third party id already exists, please enter a unique third party id or a unique suffix if adding a built-in provider.",
	NAME_REQUIRED: "Name is required",
	CLIENT_ID_REQUIRED: "Client Id is required",
	CLIENT_SECRET_REQUIRED: "Client Secret is required",
	CLIENT_TYPE_REQUIRED: "Client Type is required",
	CLIENT_TYPE_UNIQUE: "Client Type should be unique",
	INVALID_URL: "should be a valid URL",
} as const;

// Generic string validation for required fields
const validateRequiredString = (
	value: string | undefined | null,
	fieldName: string,
	errorMessage: string,
	errors: ValidationErrors
): boolean => {
	if (typeof value !== "string" || value.trim() === "") {
		errors[fieldName] = errorMessage;
		return false;
	}
	return true;
};

const validateThirdPartyId = (
	thirdPartyId: string,
	existingProviderIds: string[],
	isAddingNewProvider: boolean,
	errors: ValidationErrors
): void => {
	const trimmedId = thirdPartyId.trim();

	if (trimmedId === "") {
		errors.thirdPartyId = ERROR_MESSAGES.THIRD_PARTY_ID_REQUIRED;
		return;
	}

	if (!THIRD_PARTY_ID_REGEX.test(trimmedId)) {
		errors.thirdPartyId = ERROR_MESSAGES.THIRD_PARTY_ID_FORMAT;
		return;
	}

	if (isAddingNewProvider && existingProviderIds.includes(trimmedId)) {
		errors.thirdPartyId = ERROR_MESSAGES.THIRD_PARTY_ID_DUPLICATE;
	}
};

const validateProviderName = (thirdPartyId: string, name: string, errors: ValidationErrors): void => {
	if (!isKnownThirdPartyId(thirdPartyId)) {
		validateRequiredString(name, "name", ERROR_MESSAGES.NAME_REQUIRED, errors);
	}
};

const validateClient = (
	client: ProviderClientState,
	clientIndex: number,
	totalClients: number,
	isAppleProvider: boolean,
	clientTypes: Set<string>,
	errors: ValidationErrors
): void => {
	// Validate client ID
	validateRequiredString(
		client.clientId,
		`clients.${clientIndex}.clientId`,
		ERROR_MESSAGES.CLIENT_ID_REQUIRED,
		errors
	);

	// Validate client secret (not required for Apple)
	if (!isAppleProvider) {
		validateRequiredString(
			client.clientSecret,
			`clients.${clientIndex}.clientSecret`,
			ERROR_MESSAGES.CLIENT_SECRET_REQUIRED,
			errors
		);
	}

	// Validate client type (required if multiple clients)
	if (totalClients > 1) {
		if (
			validateRequiredString(
				client.clientType,
				`clients.${clientIndex}.clientType`,
				ERROR_MESSAGES.CLIENT_TYPE_REQUIRED,
				errors
			)
		) {
			// Only check for uniqueness if the field is valid
			const clientType = client.clientType;
			if (clientType && clientTypes.has(clientType)) {
				errors[`clients.${clientIndex}.clientType`] = ERROR_MESSAGES.CLIENT_TYPE_UNIQUE;
			}
			if (clientType) {
				clientTypes.add(clientType);
			}
		}
	}
};

const validateCustomFields = (
	clients: ProviderClientState[],
	customFields: ProviderCustomField[],
	errors: ValidationErrors
): void => {
	clients.forEach((client, clientIndex) => {
		customFields.forEach((field) => {
			if (!field.required) return;

			const fieldValue = client.additionalConfig.find(([key]) => key === field.id)?.[1];
			validateRequiredString(
				fieldValue,
				`clients.${clientIndex}.additionalConfig.${field.id}`,
				`${field.label} is required`,
				errors
			);
		});
	});
};

const validateUrl = (
	url: string | undefined,
	fieldName: string,
	displayName: string,
	errors: ValidationErrors
): void => {
	if (url !== undefined && url !== "" && !isValidHttpUrl(url.trim())) {
		errors[fieldName] = `${displayName} should be a valid URL`;
	}
};

const validateEndpointUrls = (state: ProviderConfigState, errors: ValidationErrors): void => {
	validateUrl(state.oidcDiscoveryEndpoint, "oidcDiscoveryEndpoint", "OIDC Discovery Endpoint", errors);
	validateUrl(state.authorizationEndpoint, "authorizationEndpoint", "Authorization Endpoint", errors);
	validateUrl(state.tokenEndpoint, "tokenEndpoint", "Token Endpoint", errors);
	validateUrl(state.userInfoEndpoint, "userInfoEndpoint", "User Info Endpoint", errors);
	validateUrl(state.jwksURI, "jwksURI", "JWKS URI", errors);
};

export const validateProviderConfig = (
	state: ProviderConfigState,
	existingProviderIds: string[],
	isAddingNewProvider: boolean,
	customFields?: ProviderCustomField[]
): ValidationErrors => {
	const errors: ValidationErrors = {};
	const clientTypes = new Set<string>();
	const isAppleProvider = state.thirdPartyId?.startsWith("apple") || false;

	// Validate third party ID
	validateThirdPartyId(state.thirdPartyId, existingProviderIds, isAddingNewProvider, errors);

	// Validate provider name for custom providers
	validateProviderName(state.thirdPartyId, state.name, errors);

	// Validate clients
	state.clients?.forEach((client, index) => {
		validateClient(client, index, state.clients?.length ?? 0, isAppleProvider, clientTypes, errors);
	});

	// Validate custom fields (e.g., Apple provider fields)
	if (customFields && customFields.length > 0 && state.clients) {
		validateCustomFields(state.clients, customFields, errors);
	}

	// Validate all endpoint URLs
	validateEndpointUrls(state, errors);

	return errors;
};
