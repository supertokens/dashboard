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
import React from "react";
import InputField from "../../../inputField/InputField";
import { NameTooltip, UserDetailInfoGridItem } from "../../userDetailInfoGrid";

type Props = {
	value: string;
	fieldName: "first_name" | "last_name";
	label: string;
	isEditing: boolean;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export const UserDetailNameField: React.FC<Props> = ({ value, fieldName, label, isEditing, onChange }: Props) => {
	let body: React.ReactNode = value === "" ? "-" : value;

	if (isEditing && value !== "FEATURE_NOT_ENABLED") {
		body = (
			<InputField
				name={fieldName}
				type="text"
				value={value === "-" ? "" : value}
				handleChange={onChange}
			/>
		);
	}

	return (
		<UserDetailInfoGridItem
			label={label}
			body={body}
			tooltip={<NameTooltip fieldName={fieldName} />}
		/>
	);
};
