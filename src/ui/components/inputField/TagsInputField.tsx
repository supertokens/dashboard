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

import "./tagsInputField.scss";

import { useState } from "react";
import { ReactComponent as CrossIcon } from "../../../assets/cross.svg";
import Badge, { type BadgeProps } from "../badge";

type TagsInputFieldProps = Omit<JSX.IntrinsicElements["input"], "onChange"> & {
	focusText?: string;
	label?: string;
	tags: string[];
	addTag: (tag: string) => void;
	removeTag: (tag: string) => void;
	tagProps?: Partial<BadgeProps>;
};

export default function TagsInputField(props: TagsInputFieldProps) {
	const { focusText, addTag, removeTag, tags, tagProps, ...rest } = props;
	const [isFocused, setIsFocused] = useState(false);

	return (
		<div className="tags-input-field-container">
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
								addTag(newTag);
								e.currentTarget.value = "";
							}
						}}
						{...rest}
						className={"text-small text-black input-field"}
					/>
				</div>
			</div>
			{focusText !== undefined && isFocused ? <p>{focusText}</p> : null}
			<div className="tags-container">
				{tags.map((tag) => {
					return (
						<Badge
							key={tag}
							{...tagProps}
							text={tag}>
							<CrossIcon onClick={() => removeTag(tag)} />
						</Badge>
					);
				})}
			</div>
		</div>
	);
}
