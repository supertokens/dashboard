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
		id: "google-workspaces",
		label: "Google Workspaces",
		icon: "provider-google.svg",
		isEnterprise: true,
	},
	{
		id: "google",
		label: "Google",
		icon: "provider-google.svg",
		isEnterprise: false,
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
		icon: "provider-active-directory.svg",
		isEnterprise: true,
	},
	{
		id: "okta",
		label: "Okta",
		icon: "provider-okta.svg",
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
		description: "Traditional email and password authentication",
		id: "emailpassword",
	},
	{
		label: "OTP via Email",
		description: "One-time password sent to email address",
		id: "otp-email",
	},
	{
		label: "OTP via SMS",
		description: "One-time password sent via SMS",
		id: "otp-phone",
	},
	{
		label: "Magic Link (Email)",
		description: "Passwordless login link sent to email",
		id: "link-email",
	},
	{
		label: "Magic Link (SMS)",
		description: "Passwordless login link sent via SMS",
		id: "link-phone",
	},
	{
		label: "Third Party",
		description: "Login with Google, GitHub, etc.",
		id: "thirdparty",
	},
];

export const SECONDARY_FACTOR_IDS = [
	{
		label: "TOTP",
		description: "Setup an authenticator app to get 2fa codes when prompted ",
		id: "totp",
	},
	{
		label: "Email based OTP",
		description: "Get an OTP code on your email address to complete authentication requests",
		id: "otp-email",
	},
	{
		label: "SMS based OTP",
		description: "Get an OTP code on your phone to complete authentication requests",
		id: "otp-phone",
	},
];
export const FactorIds = {
	EMAILPASSWORD: "emailpassword",
	OTP_EMAIL: "otp-email",
	OTP_PHONE: "otp-phone",
	LINK_EMAIL: "link-email",
	LINK_PHONE: "link-phone",
	THIRDPARTY: "thirdparty",
	TOTP: "totp",
};
