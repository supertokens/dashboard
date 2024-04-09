/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
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
import { ChangeEvent } from "react";
import "./checkbox.scss";

export const Checkbox = ({
	id,
	label,
	onChange,
	checked,
	disabled,
}: {
	id: string;
	label: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	checked: boolean;
	disabled?: boolean;
}) => {
	return (
		<div className={`checkbox-container ${disabled ? "checkbox-container--disabled" : ""}`}>
			<input
				type="checkbox"
				id={id}
				name={id}
				onChange={onChange}
				checked={checked}
				disabled={disabled}
			/>
			<label htmlFor={id}>{label}</label>
		</div>
	);
};
