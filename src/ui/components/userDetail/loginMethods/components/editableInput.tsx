import React, { useState } from "react";
import InputField from "../../../inputField/InputField";
import "./editableInput.scss";
import { PhoneNumberInput } from "../../../phoneNumber/PhoneNumberInput";
import phoneNumber from "../../../phoneNumber/PhoneNumber";

export type EditableInputProps = {
	label: string;
	val: string;
	edit: boolean;
	type: "email" | "phone";
	onChange: (val: string) => void;
};

export const EditableInput = ({ label, val, edit, type, onChange }: EditableInputProps) => {
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
				{type === "email" && (
					<InputField
						type="email"
						name="email"
						error={""}
						value={val}
						// handleChange={({ target: { value } }) => updateUserDataState({ emails: [value] })}
						handleChange={({ target }) => {
							setVal(target.value);
							onChange(target.value);
						}}
					/>
				)}
				{type === "phone" && (
					<PhoneNumberInput
						value={val}
						name="Phone Number"
						onChange={setVal}
					/>
				)}
			</span>
		);
	}
};
