import Badge from "../../badge";
import "./selectPermissions.scss";

import { useState } from "react";
import { ReactComponent as SecuityKeyIcon } from "../../../../assets/secuity-key.svg";
import { ReactComponent as TrashIcon } from "../../../../assets/trash.svg";

export default function SelectPermissions({
	permissions,
	setPermissionsToDelete,
	addPermissions,
}: {
	permissions: string[];
	addPermissions: (permissions: string[]) => void;
	setPermissionsToDelete: (permissions: string[]) => void;
}) {
	const [isFocused, setIsFocused] = useState(false);
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

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
									if (newTag && permissions.includes(newTag) === false) {
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
						disabled={selectedPermissions.length < 1}
						className="delete-role"
						onClick={() => setPermissionsToDelete(selectedPermissions)}>
						<TrashIcon />
					</button>
				</div>
				<div className="permissions-list">
					{permissions.map((permission) => {
						const isSelected = selectedPermissions.includes(permission);
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
											setSelectedPermissions([...selectedPermissions, permission]);
										} else {
											setSelectedPermissions(selectedPermissions.filter((p) => p !== permission));
										}
									}}
								/>
							</div>
						);
					})}
					{permissions.length < 1 ? (
						<div className="info-container">
							<SecuityKeyIcon />
							<h1>This Role don't have any permissions associated.</h1>
							<p>Please add permissions to this role.</p>
						</div>
					) : null}
				</div>
			</div>
		</>
	);
}
