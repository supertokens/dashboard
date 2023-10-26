import { useState } from "react";

import Badge from "../../badge";

import { Role } from "../types";
import "./editPermissions.scss";

type CheckboxInputFieldProps = Omit<JSX.IntrinsicElements["input"], "onChange"> & {
	label?: string;
	focusText?: string;
	permissions: string[];
	onPermissionsChange: (permissions: string[]) => void;
	selectedRole: Role;
};

export default function EditPermissions(props: CheckboxInputFieldProps) {
	const { focusText = "", permissions, selectedRole, ...rest } = props;
	const [isFocused, setIsFocused] = useState(false);

	return (
		<div className="edit-permissions-container">
			<div className="input-field-container">
				{props.label && (
					<label
						htmlFor={props.name}
						className="text-small input-label">
						{props.label}
					</label>
				)}
				<div className={`input-field-inset ${isFocused ? "input-field-inset-focused" : ""}`}>
					<input
						type="text"
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								const newTag = e.currentTarget.value.trim();
								if (newTag && permissions.includes(newTag) === false) {
									alert("90");
								}
								e.currentTarget.value = "";
							}
						}}
						{...rest}
						className={"text-small text-black input-field"}
					/>
				</div>
			</div>
			{focusText && isFocused ? <p className="focus-text">{focusText}</p> : null}
			<div className="permissions-list-wrapper">
				<div className="permissions-list-header">Permissions</div>
				<div className="permissions-list">
					{selectedRole.permissions.map((permission) => {
						return (
							<div
								className="permission-item"
								key={permission}>
								<Badge
									size="sm"
									text={permission}
								/>
								<input
									type="checkbox"
									id="checkbox"
								/>
							</div>
						);
					})}

					{permissions.map((tag) => {
						return (
							<div
								className="permission-item"
								key={tag}>
								<Badge
									key={tag}
									text={tag}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
