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

import type { BuiltInProvidersCustomFields } from "@api/tenants/types";

export const PROVIDERS_WITH_ADDITIONAL_CONFIG = ["google-workspaces", "active-directory", "okta", "boxy-saml"];

export const IN_BUILT_PROVIDERS_CUSTOM_FIELDS_FOR_CLIENT: BuiltInProvidersCustomFields = {
	apple: [
		{
			label: "Key Id",
			id: "keyId",
			tooltip: "The key Id for Apple.",
			type: "text",
			required: true,
		},
		{
			label: "Team Id",
			id: "teamId",
			tooltip: "The team Id for Apple.",
			type: "text",
			required: true,
		},
		{
			label: "Private Key",
			id: "privateKey",
			tooltip: "The private key for Apple.",
			type: "multiline",
			required: true,
		},
	],
};

export const SAML_NAME_OPTIONS = [
	"Microsoft Entra ID",
	"Microsoft AD FS",
	"Okta",
	"Auth0",
	"Google",
	"OneLogin",
	"PingOne",
	"JumpCloud",
	"Rippling",
	"SAML",
];
