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

export default function SideBar() {
	const location = useLocation();

	return (
		<aside className="sidebar">
			<ul>
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
		</aside>
	);
}
