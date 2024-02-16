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

// TODO: This will be coming from the API
export const CORE_CONFIG_PROPERTIES = [
	{
		name: "supertokens_max_cdi_version",
		description:
			"This is used when the core needs to assume a specific CDI version when CDI version is not specified in the request. When set to null, the core will assume the latest version of the CDI. (Default: null)",
		isDifferentAcrossTenants: false,
		type: "string",
	},
	{
		name: "disable_telemetry",
		description:
			"Learn more about Telemetry here: https://github.com/supertokens/supertokens-core/wiki/Telemetry. (Default: false)",
		isDifferentAcrossTenants: false,
		type: "boolean",
	},
	{
		name: "email_verification_token_lifetime",
		description:
			"Time in milliseconds for how long an email verification token / link is valid for. [Default: 24 * 3600 * 1000 (1 day)]",
		isDifferentAcrossTenants: true,
		type: "number",
	},
	{
		name: "passwordless_code_lifetime",
		description: "Time in milliseconds for how long a passwordless code is valid for. [Default: 900000 (15 mins)]",
		isDifferentAcrossTenants: true,
		type: "number",
	},
	{
		name: "firebase_password_hashing_signer_key",
		description: "The signer key used for firebase scrypt password hashing. (Default: null)",
		isDifferentAcrossTenants: false,
		type: "string",
	},
	{
		name: "passwordless_max_code_input_attempts",
		description:
			"The maximum number of code input attempts per login before the user needs to restart. (Default: 5)",
		isDifferentAcrossTenants: true,
		type: "number",
	},
	{
		name: "totp_max_attempts",
		description: "The maximum number of invalid TOTP attempts that will trigger rate limiting. (Default: 5)",
		isDifferentAcrossTenants: true,
		type: "number",
	},
	{
		name: "refresh_token_validity",
		description: "Time in mins for how long a refresh token is valid for. [Default: 60 * 2400 (100 days)]",
		isDifferentAcrossTenants: false,
		type: "number",
	},
	{
		name: "access_token_dynamic_signing_key_update_interval",
		description: "Time in hours for how frequently the dynamic signing key will change. [Default: 168 (1 week)]",
		isDifferentAcrossTenants: false,
		type: "number",
	},
	{
		name: "access_token_signing_key_dynamic",
		description:
			"Deprecated, please see changelog.\n If this is set to true, the access tokens created using CDI<=2.18 will be signed using a static signing key. (Default: true)",
		isDifferentAcrossTenants: false,
		type: "boolean",
	},
	{
		name: "access_token_blacklisting",
		description:
			"Deprecated, please see changelog. Only used in CDI<=2.18\n If true, allows for immediate revocation of any access token. Keep in mind that setting this to true will result in a db query for each API call that requires authentication. (Default: false)",
		isDifferentAcrossTenants: false,
		type: "boolean",
	},
	{
		name: "api_keys",
		description:
			"The API keys to query an instance using this config file. The format is \"key1,key2,key3\". Keys can only contain '=', '-' and alpha-numeric (including capital) chars. Each key must have a minimum length of 20 chars. (Default: null)",
		isDifferentAcrossTenants: false,
		type: "string",
	},
	{
		name: "password_reset_token_lifetime",
		description:
			"Time in milliseconds for how long a password reset token / link is valid for. [Default: 3600000 (1 hour)]",
		isDifferentAcrossTenants: true,
		type: "number",
	},
	{
		name: "totp_rate_limit_cooldown_sec",
		description:
			"The time in seconds for which the user will be rate limited once totp_max_attempts is crossed. [Default: 900 (15 mins)]",
		isDifferentAcrossTenants: true,
		type: "number",
	},
	{
		name: "access_token_validity",
		description: "Time in seconds for how long an access token is valid for. [Default: 3600 (1 hour)]",
		isDifferentAcrossTenants: false,
		type: "number",
	},
	{
		name: "password_hashing_alg",
		// eslint-disable-next-line @typescript-eslint/quotes
		description: 'The password hashing algorithm to use. Values are "ARGON2" | "BCRYPT". (Default: BCRYPT)',
		isDifferentAcrossTenants: false,
		options: ["ARGON2", "BCRYPT"],
		type: "enum",
	},
	{
		name: "postgresql_thirdparty_users_table_name",
		description: "The name of the thirdparty users table.",
		isDifferentAcrossTenants: true,
		type: "string",
	},
	{
		name: "postgresql_key_value_table_name",
		description: "The name of the key value table.",
		isDifferentAcrossTenants: true,
		type: "string",
	},
	{
		name: "postgresql_session_info_table_name",
		description: "The name of the session info table.",
		isDifferentAcrossTenants: true,
		type: "string",
	},
	{
		name: "postgresql_emailverification_verified_emails_table_name",
		description: "The name of the emailverification verified emails table.",
		isDifferentAcrossTenants: true,
		type: "string",
	},
	{
		name: "postgresql_table_names_prefix",
		description: "The prefix to be added to all table names.",
		isDifferentAcrossTenants: true,
		type: "string",
	},
	{
		name: "postgresql_config_version",
		description: "The version of the config.",
		isDifferentAcrossTenants: true,
		type: "number",
	},
	{
		name: "postgresql_emailpassword_users_table_name",
		description: "The name of the emailpassword users table.",
		isDifferentAcrossTenants: true,
		type: "string",
	},
	{
		name: "postgresql_emailverification_tokens_table_name",
		description: "The name of the emailverification tokens table.",
		isDifferentAcrossTenants: true,
		type: "string",
	},
	{
		name: "postgresql_emailpassword_pswd_reset_tokens_table_name",
		description: "The name of the emailpassword password reset tokens table.",
		isDifferentAcrossTenants: true,
		type: "string",
	},
];
