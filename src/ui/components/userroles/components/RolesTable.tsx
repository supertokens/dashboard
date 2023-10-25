import Badge from "../../badge";
import Button from "../../button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";

import "./rolesTable.scss";

export function RolesTable() {
	return (
		<Table className="theme-blue">
			<TableHeader>
				<TableRow>
					<TableHead className="roles-column">
						<div className="checkbox-text-container">
							<input
								type="checkbox"
								name="check"
								id="check"
							/>
							User Roles
						</div>
					</TableHead>
					<TableHead>
						<div className="delete-btn-container">
							Permissions
							<Button
								color="gray"
								size="sm">
								Delete
							</Button>
						</div>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>
						<div className="checkbox-text-container">
							<input
								type="checkbox"
								name="check"
								id="check"
							/>
							Role1
						</div>
					</TableCell>
					<TableCell>
						<div className="permissions-container">
							<Badge>Permissions</Badge>
							<Badge>Permissions</Badge>
							<Badge>Permissions</Badge>
							<Badge>Permissions</Badge>
						</div>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>
						<div className="checkbox-text-container">
							<input
								type="checkbox"
								name="check"
								id="check"
							/>
							Role2
						</div>
					</TableCell>
					<TableCell>
						<div className="permissions-container">
							<Badge>User</Badge>
							<Badge>Admin</Badge>
						</div>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
