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

import { isValidHttpUrl } from "@shared/utils";
import type { ProviderCustomField } from "@api/tenants/types";
import type { ProviderConfigState } from "./providerConfigHelpers";
import { isKnownThirdPartyId } from "./providerConfigHelpers";

export const validateProviderConfig = (
	state: ProviderConfigState,
	existingProviderIds: string[],
	isAddingNewProvider: boolean,
	customFields?: ProviderCustomField[]
): Record<string, string> => {
	const errors: Record<string, string> = {};
	const clientTypes = new Set<string>();
	const isAppleProvider = state.thirdPartyId?.startsWith("apple");

	// Validate thirdPartyId
	if (state.thirdPartyId.trim() === "") {
		errors.thirdPartyId = "Third Party Id is required";
	} else if (!state.thirdPartyId.match(/^[a-z0-9-]+$/)) {
		errors.thirdPartyId = "Third Party Id can only contain lowercase alphabets, numbers and hyphens";
	} else if (isAddingNewProvider && existingProviderIds.includes(state.thirdPartyId)) {
		errors.thirdPartyId =
			"Another provider with this third party id already exists, please enter a unique third party id or a unique suffix if adding a built-in provider.";
	}

	// Validate name for custom providers
	if (!isKnownThirdPartyId(state.thirdPartyId) && state.name.trim() === "") {
		errors.name = "Name is required";
	}

	// Validate clients
	state.clients?.forEach((client, index) => {
		if (typeof client.clientId !== "string" || client.clientId.trim() === "") {
			errors[`clients.${index}.clientId`] = "Client Id is required";
		}
		if (!isAppleProvider) {
			if (client.clientSecret === undefined || client.clientSecret.trim() === "") {
				errors[`clients.${index}.clientSecret`] = "Client Secret is required";
			}
		}
		if ((state.clients?.length ?? 0) > 1) {
			if (client.clientType === undefined || client.clientType.trim() === "") {
				errors[`clients.${index}.clientType`] = "Client Type is required";
			} else {
				if (clientTypes.has(client.clientType)) {
					errors[`clients.${index}.clientType`] = "Client Type should be unique";
				}
				clientTypes.add(client.clientType);
			}
		}
	});

	// Validate custom fields for special providers
	if (customFields !== undefined && customFields.length > 0) {
		state.clients?.forEach((client, index) => {
			customFields?.forEach((field) => {
				const fieldValue = client.additionalConfig.find(([key]) => key === field.id)?.[1];
				if (field.required && (typeof fieldValue !== "string" || fieldValue.trim() === "")) {
					errors[`clients.${index}.additionalConfig.${field.id}`] = `${field.label} is required`;
				}
			});
		});
	}

	// Validate URLs
	if (
		state.oidcDiscoveryEndpoint !== undefined &&
		state.oidcDiscoveryEndpoint !== "" &&
		!isValidHttpUrl(state.oidcDiscoveryEndpoint.trim())
	) {
		errors.oidcDiscoveryEndpoint = "OIDC Discovery Endpoint should be a valid URL";
	}

	if (
		state.tokenEndpoint !== undefined &&
		state.tokenEndpoint !== "" &&
		!isValidHttpUrl(state.tokenEndpoint.trim())
	) {
		errors.tokenEndpoint = "Token Endpoint should be a valid URL";
	}

	if (
		state.authorizationEndpoint !== undefined &&
		state.authorizationEndpoint !== "" &&
		!isValidHttpUrl(state.authorizationEndpoint.trim())
	) {
		errors.authorizationEndpoint = "Authorization Endpoint should be a valid URL";
	}

	if (
		state.userInfoEndpoint !== undefined &&
		state.userInfoEndpoint !== "" &&
		!isValidHttpUrl(state.userInfoEndpoint.trim())
	) {
		errors.userInfoEndpoint = "User Info Endpoint should be a valid URL";
	}

	if (state.jwksURI !== undefined && state.jwksURI !== "" && !isValidHttpUrl(state.jwksURI.trim())) {
		errors.jwksURI = "JWKS URI should be a valid URL";
	}

	return errors;
};
