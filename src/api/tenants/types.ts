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

export type Tenant = {
	tenantId: string;
	firstFactors: string[];
};

export type PasswordlessContactMethod = "PHONE" | "EMAIL" | "EMAIL_OR_PHONE";

export type UserInfoMap = {
	fromIdTokenPayload?: {
		userId?: string;
		email?: string;
		emailVerified?: string;
	};
	fromUserInfoAPI?: {
		userId?: string;
		email?: string;
		emailVerified?: string;
	};
};

type CommonProviderConfig = {
	thirdPartyId: string;
	name?: string;
	authorizationEndpoint?: string;
	authorizationEndpointQueryParams?: { [key: string]: string | null };
	tokenEndpoint?: string;
	tokenEndpointBodyParams?: { [key: string]: string };
	userInfoEndpoint?: string;
	userInfoEndpointQueryParams?: { [key: string]: string | null };
	userInfoEndpointHeaders?: { [key: string]: string | null };
	jwksURI?: string;
	oidcDiscoveryEndpoint?: string;
	userInfoMap?: UserInfoMap;
	requireEmail?: boolean;
};

export type ProviderClientConfig = {
	clientType?: string;
	clientId: string;
	clientSecret?: string;
	scope?: string[] | null;
	forcePKCE?: boolean;
	additionalConfig?: { [key: string]: any };
};

export type ProviderConfig = CommonProviderConfig & {
	clients?: ProviderClientConfig[];
};

export type ProviderConfigResponse = ProviderConfig & {
	isGetAuthorisationRedirectUrlOverridden: boolean;
	isExchangeAuthCodeForOAuthTokensOverridden: boolean;
	isGetUserInfoOverridden: boolean;
};

export type TenantInfo = {
	tenantId: string;
	thirdParty: {
		providers: { thirdPartyId: string; name: string }[];
	};
	firstFactors: string[];
	requiredSecondaryFactors?: string[] | null;
	coreConfig: CoreConfigFieldInfo[];
	userCount: number;
};

export type UpdateTenant = {
	emailPasswordEnabled?: boolean;
	passwordlessEnabled?: boolean;
	thirdPartyEnabled?: boolean;
	firstFactors?: string[] | null;
	requiredSecondaryFactors?: string[] | null;
	coreConfig?: Record<string, unknown>;
};

export type CoreConfigFieldInfo = {
	key: string;
	valueType: "string" | "boolean" | "number";
	value: string | number | boolean | null;
	description: string;
	isDifferentAcrossTenants: boolean;
	possibleValues?: string[];
	isNullable: boolean;
	defaultValue: string | number | boolean | null;
	isPluginProperty: boolean;
	isPluginPropertyEditable: boolean;
};

export type TenantDashboardView =
	| {
			view: "tenant-detail";
	  }
	| {
			view: "add-or-edit-third-party-provider";
			thirdPartyId?: string;
			isAddingNewProvider: boolean;
	  };

export type ProviderCustomField = {
	label: string;
	id: string;
	tooltip: string;
	type: "text" | "password" | "multiline";
	required: boolean;
};

export type BuiltInProvidersCustomFields = {
	[key: string]: ProviderCustomField[];
};

export type ProviderClientState = Omit<ProviderClientConfig, "additionalConfig"> & {
	additionalConfig: [string, string | null][];
	// Generated locally to correctly render clients list
	key: string;
};
