/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
import React, { useCallback, useState } from "react";
import { getImageUrl } from "../../../utils";
import TooltipContainer from "../tooltip/tooltip";

import "./InputField.css";

export type InputFieldPropTypes = {
	type: "text" | "email" | "password";
	name: string;
	size?: "small" | "medium";
	label?: string;
	value?: string | undefined;
	placeholder?: string;
	error?: string;
	isRequired?: boolean;
	hideColon?: boolean;
	forceShowError?: boolean;
	disabled?: boolean;
	prefix?: string;
	autofocus?: boolean;
	handleChange: React.ChangeEventHandler<HTMLInputElement>;
	/** @default "bottom" */
	errorPlacement?: "bottom" | "prefix-tooltip";
};

const InputField: React.FC<InputFieldPropTypes> = (props) => {
	const handleChange = props.handleChange;
	const { errorPlacement = "bottom" } = props;
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [isTouched, setIsTouched] = useState(false);

	const onChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setIsTouched(true);
			handleChange(event);
		},
		[handleChange]
	);

	const showError = props.error && (isTouched || props.forceShowError);

	return (
		<div className="input-field-container">
			{props.label && (
				<label
					htmlFor={props.name}
					className="text-small input-label">
					{props.label}
					{props.isRequired && <span className="text-error input-label-required">*</span>}
					{!props.hideColon ? ":" : ""}
				</label>
			)}
			<div
				className={`input-field-inset ${isFocused ? "input-field-inset-focused" : ""} ${
					showError ? "input-field-inset-error-state" : ""
				} ${props.prefix ? "input-field-inset-with-prefix" : ""}`}>
				{props.prefix && (
					<div
						className={`input-field-prefix ${isFocused ? "input-field-prefix-focused" : ""} ${
							showError ? "input-field-prefix-error" : ""
						}`}>
						{props.prefix}
					</div>
				)}
				<input
					type={props.type === "password" && showPassword ? "text" : props.type}
					name={props.name}
					id={props.name}
					onChange={onChange}
					onKeyUp={onChange}
					value={props.value}
					autoFocus={props.autofocus}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					disabled={props.disabled}
					className={`text-small text-black input-field ${showError ? "input-field-error-state" : ""} ${
						props.size === "small" ? "input-field-small" : ""
					}`}
					placeholder={props.placeholder}
				/>
				<div className="input-field-suffix">
					{props.type === "password" && props.value !== undefined && props.value.length > 0 && (
						<img
							className="icon"
							onClick={() => setShowPassword(!showPassword)}
							src={getImageUrl(`eye${showPassword ? "-stroke" : ""}.svg`)}
							alt="toggle-visibility"
						/>
					)}
				</div>
			</div>
			{showError && errorPlacement === "bottom" && (
				<div className="input-field-error block-small block-error">
					<img
						className="input-field-error-icon"
						src={getImageUrl("form-field-error-icon.svg")}
						alt="Error in field"
					/>
					<p className="input-field-error-text text-small text-error">{props.error}</p>
				</div>
			)}
			{showError && errorPlacement === "prefix-tooltip" && (
				<div className="input-error-prefix-tooltip">
					<TooltipContainer
						tooltip={props.error}
						position="bottom">
						<img
							className="input-field-error-icon"
							src={getImageUrl("form-field-error-icon.svg")}
							alt="Error in field"
						/>
					</TooltipContainer>
				</div>
			)}
		</div>
	);
};

export default InputField;
