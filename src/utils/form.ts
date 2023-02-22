/* eslint-disable no-useless-escape */

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

import { isValidPhoneNumber } from "libphonenumber-js";

export const validateEmail = (email: string) => {
	// We use the same regex as supertokens-root
	const regexPatternForEmail =
		"((^<>()[].,;:@]+(.^<>()[].,;:@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$";
	return new RegExp(regexPatternForEmail).test(email);
};

export const isNotEmpty = (value: any) => {
	return !(value === undefined || value === null || `${value}`.trim().length === 0);
};

export const validatePhoneNumber = isValidPhoneNumber;
