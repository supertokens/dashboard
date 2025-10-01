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

import UserDetailTest from "@components/userDetail/userDetailTest";
import { useSearchParams } from "react-router-dom";
import { UsersList } from "./components/user-list/UsersList";

/**
 * This is the main component for the user management tab.
 * It renders the user-detail page if a userid search param is provided in the URL,
 * otherwise it renders the users-list page.
 */
export function UserManagement() {
	const [searchParams] = useSearchParams();
	const userId = searchParams.get("userid");

	return userId ? <UserDetailTest userId={userId} /> : <UsersList />;
}
