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

import "./nativeSelect.scss";

type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
	options: Array<string>;
	label?: string;
	isRequired?: boolean;
};

export const NativeSelect = ({ options, label, isRequired, ...rest }: NativeSelectProps) => {
	return (
		<div className="select-container">
			{label && (
				<label
					htmlFor={rest.id}
					className="text-small select-label">
					{label}
					{isRequired && <span className="text-error select-label-required">*</span>}
				</label>
			)}
			<div className="select-wrapper">
				<select
					className="native-select"
					{...rest}>
					<option
						value=""
						disabled>
						Select an option
					</option>
					{options.map((option, index) => (
						<option
							key={index}
							value={option}>
							{option}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};
