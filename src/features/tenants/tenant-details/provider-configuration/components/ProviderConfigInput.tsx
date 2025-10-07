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

import { Flex, Text, TextField } from "@radix-ui/themes";

import style from "./ProviderConfigInput.module.scss";

interface ProviderConfigInputProps {
	disabled?: boolean;
	readonly?: boolean;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	error?: string;
}

export const ProviderConfigInput = ({
	disabled = false,
	readonly = false,
	value,
	onChange,
	placeholder,
	error,
}: ProviderConfigInputProps) => (
	<Flex
		direction="column"
		gap="1"
		style={{ flex: 1 }}>
		<TextField.Root
			size="3"
			variant="surface"
			disabled={disabled}
			readOnly={readonly}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			className={`${style["provider-config-input"]} ${disabled ? style["provider-config-input--disabled"] : ""} ${
				readonly ? style["provider-config-input--disabled"] : ""
			}`}
		/>
		{error && (
			<Text
				className={`${style["provider-config-input__error"]}`}
				size="1"
				color="red">
				{error}
			</Text>
		)}
	</Flex>
);
