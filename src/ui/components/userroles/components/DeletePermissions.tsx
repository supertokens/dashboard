import Badge from "../../badge";
import "./deletePermissions.scss";

import { ReactComponent as SecuityKeyIcon } from "../../../../assets/roles-and-permissions.svg";
import { ReactComponent as TrashIcon } from "../../../../assets/trash.svg";

export default function DeletePermissions({
	onDelete,
	permissionsToDelete,
	permissions,
	setPermissionsToDelete,
}: {
	onDelete: () => void;
	permissionsToDelete: string[];
	permissions: string[];
	setPermissionsToDelete: (permissions: string[]) => void;
}) {
	return (
		<>
			<div className="delete-permissions-container margin-top-20">
				<div className="container-header">
					Permissions
					<button
						disabled={permissionsToDelete.length < 1}
						className="delete-role"
						onClick={onDelete}>
						<TrashIcon />
					</button>
				</div>
				<div className="permissions-list">
					{permissions.map((permission) => {
						const isSelected = permissionsToDelete.includes(permission);
						return (
							<div
								key={permission}
								className="permission-item"
								data-selected={isSelected === true ? "true" : "false"}>
								<Badge
									size="sm"
									text={permission}
								/>
								<input
									type="checkbox"
									id={permission}
									name={permission}
									defaultChecked={isSelected}
									onChange={(e) => {
										if (e.currentTarget.checked) {
											setPermissionsToDelete([...permissionsToDelete, permission]);
										} else {
											setPermissionsToDelete(permissionsToDelete.filter((p) => p !== permission));
										}
									}}
								/>
							</div>
						);
					})}
					{permissions.length < 1 ? (
						<div className="info-container">
							<SecuityKeyIcon />
							<h1>No Permissions associated with this Role!</h1>
							<p>Added Permissions for role will appear here.</p>
						</div>
					) : null}
				</div>
			</div>
		</>
	);
}
