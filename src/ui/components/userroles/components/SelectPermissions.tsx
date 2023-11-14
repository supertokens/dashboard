import Badge from "../../badge";
import "./selectPermissions.scss";

import { useState } from "react";
import { ReactComponent as SecuityKeyIcon } from "../../../../assets/secuity-key.svg";
import { ReactComponent as TrashIcon } from "../../../../assets/trash.svg";

export default function SelectPermissions({
	permissions,
	permissionsToDelete,
	setPermissionsToDelete,
	addPermissions,
	openDeletePermissionsDialog,
}: {
	permissions: string[];
	addPermissions: (permissions: string[]) => void;
	permissionsToDelete: string[];
	setPermissionsToDelete: (permissions: string[]) => void;
	openDeletePermissionsDialog: () => void;
}) {
	//	used to know whether the input is in or out off focus.
	const [isFocused, setIsFocused] = useState(false);

	return (
		<>
			<div className="tags-input-field-container margin-bottom-5">
				<div className="input-field-container">
					<label
						htmlFor="permissions"
						className="text-small input-label">
						Add Permissions
					</label>
					<div className={`input-field-inset ${isFocused ? "input-field-inset-focused" : ""}`}>
						<input
							type="text"
							name="permissions"
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									const newTag = e.currentTarget.value.trim();
									if (newTag !== "" && permissions.includes(newTag) === false) {
										addPermissions([newTag]);
									}
									e.currentTarget.value = "";
								}
							}}
							className={"text-small text-black input-field"}
						/>
					</div>
				</div>
				{isFocused ? (
					<p className="margin-y-5">Write permission name and press enter to add it in the list.</p>
				) : null}
			</div>
			<div className="select-permissions-container margin-top-5">
				<div className="container-header">
					Permissions
					<button
						disabled={permissionsToDelete.length < 1}
						className="delete-role"
						onClick={openDeletePermissionsDialog}>
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
