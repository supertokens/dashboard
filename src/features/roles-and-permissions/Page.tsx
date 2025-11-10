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

import { useSearchParams } from "react-router-dom";

import RoleDetails from "./roles-details/RoleDetails";
import RolesList from "./components/RolesList";
import { Implementation } from "../../implementation";

/**
 * This is the main component for the roles and permissions page.
 * It renders the role-detail page if a roleid search param is provided in the URL,
 * otherwise it renders the roles-list page.
 */
export default function RolesAndPermissions() {
	const [searchParams] = useSearchParams();
	const { QUERY_PARAMS } = Implementation.getInstanceOrThrow().getNavigation();
	const roleId = searchParams.get(QUERY_PARAMS.ROLE_ID);

	return !roleId ? <RolesList /> : <RoleDetails roleId={roleId} />;
}
