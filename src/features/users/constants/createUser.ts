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

export const STATUS = {
	OK: "OK",
	EMAIL_VALIDATION_ERROR: "EMAIL_VALIDATION_ERROR",
	PHONE_VALIDATION_ERROR: "PHONE_VALIDATION_ERROR",
	PASSWORD_VALIDATION_ERROR: "PASSWORD_VALIDATION_ERROR",
	EMAIL_ALREADY_EXISTS_ERROR: "EMAIL_ALREADY_EXISTS_ERROR",
	FEATURE_NOT_ENABLED_ERROR: "FEATURE_NOT_ENABLED_ERROR",
} as const;

export const MESSAGES = {
	SUCCESS: "User created successfully!",
	FEATURE_NOT_ENABLED: "Feature not enabled!",
	GENERIC_ERROR: "Something went wrong, please try again!",
	NO_AUTH_METHOD: "No matching auth method found!",
	INVALID_EMAIL_OR_PHONE: "Please enter a valid email or phone number.",
	EMAIL_ALREADY_EXISTS: "User with this email already exists!",
	PHONE_ALREADY_EXISTS: "User with this phone number already exists!",
} as const;
