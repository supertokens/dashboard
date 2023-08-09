import React, { useState } from "react";
import InputField from "../../../inputField/InputField";
import "./editableInput.scss";

export type EditableInputProps = {
	label: string;
	val: string;
	edit: boolean;
};

export const EditableInput = ({ label, val, edit }: EditableInputProps) => {
	const [normaliseVal, setVal] = useState(val);
	if (!edit) {
		return (
			<span>
				{label}:&nbsp; <b>{normaliseVal == "" ? "-" : normaliseVal}</b>
			</span>
		);
	} else {
		return (
			<span className="input">
				{label}:&nbsp;{" "}
				<InputField
					type="email"
					name="email"
					error={"shit happens"}
					value={val}
					// handleChange={({ target: { value } }) => updateUserDataState({ emails: [value] })}
					handleChange={({ target }) => setVal(target.value)}
				/>
			</span>
		);
	}
};
