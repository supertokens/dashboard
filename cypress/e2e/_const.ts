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

export * from "../../src/cy-element-ids";
export { StorageKeys } from "../../src/constants";

export const URL_ROOT = 'http://localhost:3001';

export const PATH_USERS = '/auth/dashboard/'
export const PATH_API_LOGIN = '/auth/dashboard/api/key/validate'
export const PATH_API_USERS_LIST = '/auth/dashboard/api/users?limit=10'

export const DATA_AUTH_KEY = 'someapikey'
