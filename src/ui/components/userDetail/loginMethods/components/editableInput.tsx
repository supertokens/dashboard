import InputField from "../../../inputField/InputField";
import { PhoneNumberInput } from "../../../phoneNumber/PhoneNumberInput";
import "./editableInput.scss";

export type EditableInputProps = {
	label: string;
	val: string;
	edit: boolean;
	type: "email" | "phone";
	onChange: (val: string) => void;
	error?: string;
};

export const EditableInput = ({ label, val, edit, type, onChange, error }: EditableInputProps) => {
	return (
		<span className="input">
			{label}:&nbsp;{" "}
			{type === "email" && (
				<InputField
					disabled={!edit}
					type="email"
					name="email"
					error={error ?? ""}
					value={val}
					handleChange={({ target }) => {
						onChange(target.value);
					}}
				/>
			)}
			{type === "phone" && (
				<PhoneNumberInput
					disabled={!edit}
					value={val}
					name="Phone Number"
					onChange={onChange}
				/>
			)}
		</span>
	);
};
