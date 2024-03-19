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
		isEnterprise: false,
	},
	{
		id: "google-workspaces",
		label: "Google Workspaces",
		icon: "provider-google.svg",
		isEnterprise: true,
	},
	{
		id: "apple",
		label: "Apple",
		icon: "provider-apple.svg",
		isEnterprise: false,
	},
	{
		id: "discord",
		label: "Discord",
		icon: "provider-discord.svg",
		isEnterprise: false,
	},
	{
		id: "facebook",
		label: "Facebook",
		icon: "provider-facebook.svg",
		isEnterprise: false,
	},
	{
		id: "github",
		label: "GitHub",
		icon: "provider-github.svg",
		isEnterprise: false,
	},
	{
		id: "linkedin",
		label: "LinkedIn",
		icon: "provider-linkedin.svg",
		isEnterprise: false,
	},
	{
		id: "twitter",
		label: "Twitter",
		icon: "provider-twitter.svg",
		isEnterprise: false,
	},
	{
		id: "active-directory",
		label: "Active Directory",
		icon: "provider-active-directory.png",
		isEnterprise: true,
	},
	{
		id: "okta",
		label: "Okta",
		icon: "provider-okta.png",
		isEnterprise: true,
	},
	{
		id: "bitbucket",
		label: "Bitbucket",
		icon: "provider-bitbucket.png",
		isEnterprise: false,
	},
	{
		id: "gitlab",
		label: "GitLab",
		icon: "provider-gitlab.svg",
		isEnterprise: false,
	},
];

export const SAML_PROVIDER_ID = "boxy-saml";

export const FIRST_FACTOR_IDS = [
	{
		label: "Email Password",
		description: "Sign in/up using email and password (Requires the EmailPassword recipe to be initialized)",
		id: "emailpassword",
		loginMethod: "emailpassword",
		recipeNotInitError:
			"EmailPassword recipe is not initialized, in your backend SDK. Please initialize the recipe to be able to use this login method.",
	},
	{
		label: "OTP - Email",
		description: "Sign in/up using OTP sent to email (Requires the Passwordless recipe to be initialized)",
		id: "otp-email",
		loginMethod: "passwordless",
		recipeNotInitError:
			"Passwordless recipe is either not initialized or not correctly configured. You need to initialize the recipe with contact method as EMAIL and flow type as USER_INPUT_CODE to use this login method.",
	},
	{
		label: "OTP - Phone",
		description: "Sign in/up using OTP sent to phone (Requires the Passwordless recipe to be initialized)",
		id: "otp-phone",
		loginMethod: "passwordless",
		recipeNotInitError:
			"Passwordless recipe is either not initialized or not correctly configured. You need to initialize the recipe with contact method as PHONE and flow type as USER_INPUT_CODE to use this login method.",
	},
	{
		label: "Link - Email",
		description: "Sign in/up using link sent to email (Requires the Passwordless recipe to be initialized)",
		id: "link-email",
		loginMethod: "passwordless",
		recipeNotInitError:
			"Passwordless recipe is either not initialized or not correctly configured. You need to initialize the recipe with contact method as EMAIL and flow type as MAGIC_LINK to use this login method.",
	},
	{
		label: "Link - Phone",
		description: "Sign in/up using link sent to phone (Requires the Passwordless recipe to be initialized)",
		id: "link-phone",
		loginMethod: "passwordless",
		recipeNotInitError:
			"Passwordless recipe is either not initialized or not correctly configured. You need to initialize the recipe with contact method as PHONE and flow type as MAGIC_LINK to use this login method.",
	},
	{
		label: "Third Party",
		description: "Sign in/up using third party providers (Requires the ThirdParty recipe to be initialized)",
		id: "thirdparty",
		loginMethod: "thirdparty",
		recipeNotInitError:
			"ThirdParty recipe is not initialized, in your backend SDK. Please initialize the recipe to be able to use this login method.",
	},
];

export const SECONDARY_FACTOR_IDS = [
	{
		label: "TOTP",
		description:
			"Require TOTP as a secondary factor for successful authentication (Requires the TOTP recipe to be initialized)",
		id: "totp",
		recipeNotInitError:
			"TOTP recipe is not initialized, in your backend SDK. Please initialize the recipe to be able to use this secondary factor.",
	},
	{
		label: "OTP - Email",
		description:
			"Require OTP sent to email as a secondary factor for successful authentication (Requires the Passwordless recipe to be initialized)",
		id: "otp-email",
		loginMethod: "passwordless",
		recipeNotInitError:
			"Passwordless recipe is either not initialized or not correctly configured. You need to initialize the recipe with contact method as EMAIL and flow type as USER_INPUT_CODE to use this secondary factor.",
	},
	{
		label: "OTP - Phone",
		description:
			"Require OTP sent to phone as a secondary factor for successful authentication (Requires the Passwordless recipe to be initialized)",
		id: "otp-phone",
		loginMethod: "passwordless",
		recipeNotInitError:
			"Passwordless recipe is either not initialized or not correctly configured. You need to initialize the recipe with contact method as PHONE and flow type as USER_INPUT_CODE to use this secondary factor.",
	},
];
