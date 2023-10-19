import Button from "../../button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";

import "./rolesTable.scss";

export function RolesTable() {
	return (
		<Table>
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
								style={{ marginLeft: "auto" }}
								color="danger"
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
					<TableCell>Item</TableCell>
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
					<TableCell>Item</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
