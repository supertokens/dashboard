/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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

export class StorageKeys {
	static AUTH_KEY = "auth-token";
	static EMAIL = "email";
	static TENANT_ID = "tenant-id";
}

// Add types as required
export enum HTTPStatusCodes {
	OK = 200,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
}

export const PUBLIC_TENANT_ID = "public";

export const IN_BUILT_THIRD_PARTY_PROVIDERS = [
	{
		id: "google",
		label: "Google",
		icon: "provider-google.svg",
	},
	{
		id: "google-workspaces",
		label: "Google Workspaces",
		icon: "provider-google.svg",
	},
	{
		id: "apple",
		label: "Apple",
		icon: "provider-apple.svg",
	},
	{
		id: "discord",
		label: "Discord",
		icon: "provider-discord.svg",
	},
	{
		id: "facebook",
		label: "Facebook",
		icon: "provider-facebook.svg",
	},
	{
		id: "github",
		label: "GitHub",
		icon: "provider-github.svg",
	},
	{
		id: "linkedin",
		label: "LinkedIn",
		icon: "provider-linkedin.svg",
	},
	{
		id: "twitter",
		label: "Twitter",
		icon: "provider-twitter.svg",
	},
	{
		id: "active-directory",
		label: "Active Directory",
		icon: "provider-active-directory.png",
	},
	{
		id: "okta",
		label: "Okta",
		icon: "provider-okta.png",
	},
	{
		id: "bitbucket",
		label: "Bitbucket",
		icon: "provider-bitbucket.png",
	},
	{
		id: "gitlab",
		label: "GitLab",
		icon: "provider-gitlab.svg",
	},
];
