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

import { InputHTMLAttributes } from "react";
import "./toggle.scss";

type ToggleProps = InputHTMLAttributes<HTMLInputElement> & {
	id: string;
	checked: boolean;
	label?: string;
};

export const Toggle = (props: ToggleProps) => {
	const { className, id, label, ...rest } = props;
	return (
		<div className="toggle-container">
			{label && (
				<label
					htmlFor={id}
					className="text-small toggle-label">
					{label}
				</label>
			)}
			<input
				type="checkbox"
				className={`toggle ${className}`}
				id={id}
				{...rest}
			/>
			<label htmlFor={id}></label>
		</div>
	);
};
