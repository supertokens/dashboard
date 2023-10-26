import { useState } from "react";

import Badge from "../../../badge";
import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../../../dialog";
import { Role } from "../../types";
import EditPermissions from "../EditPermissions";
import "./editRole.scss";

export default function EditRoleDialog({ closeDialog, selectedRole }: { closeDialog: () => void; selectedRole: Role }) {
	const [isInEditingMode, setIsInEditingMode] = useState(true);

	return (
		<Dialog closeDialog={closeDialog}>
			<DialogContent>
				<DialogHeader>Role Info</DialogHeader>
				{isInEditingMode ? (
					<>
						<div className="edit-role-content">
							<div>
								<span className="label">Name of the Role</span>
								<span className="role-name">{selectedRole.role}</span>
							</div>
							<div>
								<EditPermissions
									selectedRole={selectedRole}
									label="Add Permissions"
									onPermissionsChange={() => {
										alert("hi");
									}}
									permissions={[]}
									focusText="Write permission name and press enter to add it in the list."
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={() => setIsInEditingMode(false)}
								color="gray-outline">
								Go Back
							</Button>
							<Button color="danger">Delete Role</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<div className="edit-role-content">
							<div>
								<span className="label">Name of the Role</span>
								<span className="role-name">{selectedRole.role}</span>
							</div>
							<div>
								<span className="label">Permissions</span>
								<div className="permissions-list-container">
									{selectedRole.permissions.map((permission) => {
										return (
											<Badge
												text={permission}
												key={permission}
											/>
										);
									})}
								</div>
							</div>
						</div>
						<DialogFooter justifyContent="space-between">
							<Button
								color="gray"
								onClick={() => setIsInEditingMode(true)}>
								Edit
							</Button>
							<Button
								onClick={closeDialog}
								color="gray-outline">
								Go Back
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
