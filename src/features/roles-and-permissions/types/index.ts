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

export type Role = {
	role: string;
	permissions: string[] | undefined;
};

export type RoleListQueryResult = {
	roles: Role[];
	isFeatureEnabled: boolean;
};

export type GetRolesResponse =
	| {
			status: "OK";
			roles: string[];
	  }
	| {
			status: "FEATURE_NOT_ENABLED_ERROR";
	  };

export type GetPermissionsResponse =
	| {
			status: "OK";
			permissions: string[];
	  }
	| {
			status: "FEATURE_NOT_ENABLED_ERROR" | "UNKNOWN_ROLE_ERROR";
	  };

export type CreateOrUpdateRoleResponse =
	| {
			status: "OK";
			createdNewRole: boolean;
	  }
	| {
			status: "FEATURE_NOT_ENABLED_ERROR" | "UNKNOWN_ROLE_ERROR";
	  };

export type DeleteRoleResponse =
	| {
			status: "OK";
			didRoleExist: boolean;
	  }
	| {
			status: "FEATURE_NOT_ENABLED_ERROR";
	  };

export type RemovePermissionsResponse =
	| {
			status: "OK" | "UNKNOWN_ROLE_ERROR" | "FEATURE_NOT_ENABLED_ERROR";
	  }
	| undefined;
