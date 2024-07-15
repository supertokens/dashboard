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
import React, { useCallback, useRef, useState } from "react";
import { getImageUrl } from "../../../utils";
import TooltipContainer from "../tooltip/tooltip";

import "./InputField.css";

export type InputDropdownPropTypes = {
	name: string;
	size?: "small" | "medium";
	label?: string;
	value?: string | undefined;
	options: string[];
	placeholder?: string;
	error?: string | JSX.Element;
	isRequired?: boolean;
	hideColon?: boolean;
	forceShowError?: boolean;
	disabled?: boolean;
	prefix?: string;
	autofocus?: boolean;
	handleChange: (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>
			| React.ChangeEvent<HTMLSelectElement>
	) => void;
	/** @default "bottom" */
	errorPlacement?: "bottom" | "prefix-tooltip";
};

const InputDropdown: React.FC<InputDropdownPropTypes> = (props) => {
	const handleChange = props.handleChange;
	const { errorPlacement = "bottom" } = props;
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const [isTouched, setIsTouched] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);

	const onChange = useCallback(
		(
			event:
				| React.ChangeEvent<HTMLInputElement>
				| React.ChangeEvent<HTMLTextAreaElement>
				| React.ChangeEvent<HTMLSelectElement>
		) => {
			setIsTouched(true);
			handleChange(event);
		},
		[handleChange]
	);

	const showError = props.error && (isTouched || props.forceShowError);

	return (
		<div
			className="input-field-container"
			onBlur={() => {
				setTimeout(() => {
					setIsFocused(false);
				}, 100);
			}}>
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
					name={props.name}
					id={props.name + "-text"}
					onChange={onChange}
					value={props.value}
					autoFocus={props.autofocus}
					onFocus={() => setIsFocused(true)}
					onBlur={() => {
						setTimeout(() => setIsFocused(false), 200);
					}}
					className={`input-dropdown text-small text-black input-field ${
						showError ? "input-field-error-state" : ""
					} ${props.size === "small" ? "input-field-small" : ""}`}
					type="text"
					ref={inputRef}
				/>
			</div>
			{isFocused && (
				<div className="input-dropdown-options">
					{props.options.map((option, index) => (
						<div
							key={index}
							className="input-dropdown-option"
							onClick={() => {
								if (inputRef.current) {
									const syntheticChangeEvent = new Event("change", { bubbles: true });
									Object.defineProperty(syntheticChangeEvent, "target", {
										value: { value: option, name: props.name },
										writable: true,
									});
									onChange(syntheticChangeEvent as unknown as React.ChangeEvent<HTMLInputElement>);
								}
							}}>
							{option}
						</div>
					))}
				</div>
			)}
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

export default InputDropdown;
