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

import { Link, useLocation } from "react-router-dom";

import { ReactComponent as PermissionsIcon } from "../../../assets/roles-and-permissions.svg";
import { ReactComponent as TenantManagementIcon } from "../../../assets/tenant-management.svg";
import { ReactComponent as UserManagementIcon } from "../../../assets/user-managment.svg";

import "./sidebar.scss";

const sidebarItems = [
	{
		id: "user-management",
		title: "User Management",
		href: "/",
		icon: <UserManagementIcon />,
	},
	{
		id: "roles-and-permissions",
		title: "Roles and Permissions",
		href: "/roles",
		icon: <PermissionsIcon />,
	},
	{
		id: "tenant-management",
		title: "Tenant Management",
		href: "/tenants",
		icon: <TenantManagementIcon />,
	},
];

export function SideBarContent() {
	const location = useLocation();

	return (
		<ul className="sidebar-list">
			{sidebarItems.map((item) => {
				return (
					<li key={item.id}>
						<Link
							className={`${location.pathname === item.href ? "active" : ""}`}
							to={item.href}>
							{item.icon} <span>{item.title}</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
export default function SideBar() {
	return (
		<aside className="sidebar">
			<SideBarContent />
		</aside>
	);
}
