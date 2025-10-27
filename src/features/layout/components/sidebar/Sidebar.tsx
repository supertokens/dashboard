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

import { Link, useLocation } from "react-router-dom";
import { Box } from "@radix-ui/themes";
import { TriangleLeftIcon, TriangleRightIcon } from "@radix-ui/react-icons";

import styles from "./Sidebar.module.scss";

import { ReactComponent as PermissionsIcon } from "@assets/role-nav-icon.svg";
import { ReactComponent as TenantManagementIcon } from "@assets/tenant-nav-icon.svg";
import { ReactComponent as UserManagementIcon } from "@assets/user-nav-icon.svg";

import { ROUTES } from "@shared/navigation";
import { withOverride } from "@plugins";

export const NAVIGATION_ITEMS = [
	{
		id: "user-management",
		label: "User Management",
		href: ROUTES.USERS,
		icon: <UserManagementIcon />,
	},
	{
		id: "roles-and-permissions",
		label: "Roles and Permissions",
		href: ROUTES.ROLES,
		icon: <PermissionsIcon />,
	},
	{
		id: "tenant-management",
		label: "Tenant Management",
		href: ROUTES.TENANTS,
		icon: <TenantManagementIcon />,
	},
];

interface SidebarProps {
	readonly isCollapsed: boolean;
	readonly onToggle: () => void;
}

const Sidebar = withOverride("Sidebar", function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
	const location = useLocation();

	const isItemActive = (href: string) => {
		return location.pathname === href;
	};

	return (
		<aside
			className={`${styles["sidebar"]} ${isCollapsed ? styles["sidebar--collapsed"] : ""}`}
			data-collapsed={isCollapsed}>
			<Box className={styles["sidebar__inner"]}>
				{/* Main Navigation */}
				<nav className={styles["sidebar__nav"]}>
					<ul className={styles["sidebar__list"]}>
						{NAVIGATION_ITEMS.map((item) => {
							const isActive = isItemActive(item.href);

							return (
								<li
									key={item.id}
									className={styles["sidebar__list-item"]}>
									<Link
										to={item.href}
										className={`${styles["sidebar__link"]} ${
											isActive ? styles["sidebar__link--active"] : ""
										}`}
										title={isCollapsed ? item.label : undefined}>
										<span className={styles["sidebar__link-icon"]}>{item.icon}</span>
										{!isCollapsed && (
											<span className={styles["sidebar__link-text"]}>{item.label}</span>
										)}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
				{/* Toggle Button */}
				<button
					onClick={onToggle}
					className={styles["sidebar__toggle-btn"]}
					aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
					{isCollapsed ? <TriangleRightIcon /> : <TriangleLeftIcon />}
				</button>
			</Box>
		</aside>
	);
});

export default Sidebar;
