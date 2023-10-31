import { Link, useLocation } from "react-router-dom";

import { ReactComponent as PermissionsIcon } from "../../../assets/roles-and-permissions.svg";
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
