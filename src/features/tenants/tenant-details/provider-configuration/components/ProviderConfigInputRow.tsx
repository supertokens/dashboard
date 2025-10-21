/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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

import { Flex, FlexProps } from "@radix-ui/themes";

import { ProviderConfigInput } from "./ProviderConfigInput";
import { ProviderConfigInputLabel } from "./ProviderConfigInputLabel";

interface ProviderConfigInputRowProps {
	label: string;
	withIcon?: boolean;
	required?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	tooltip?: string;
	error?: string;
}

export const ProviderConfigInputRow = ({
	label,
	withIcon = true,
	required,
	disabled,
	readonly,
	value,
	onChange,
	tooltip,
	error,
	...props
}: ProviderConfigInputRowProps & Omit<FlexProps, "value" | "onChange">) => (
	<Flex
		align="center"
		gap="2"
		style={{ width: "100%" }}
		{...props}>
		<ProviderConfigInputLabel
			label={label}
			withIcon={withIcon}
			required={required}
			tooltip={tooltip}
		/>
		<ProviderConfigInput
			disabled={disabled}
			readonly={readonly}
			value={value}
			onChange={onChange}
			error={error}
		/>
	</Flex>
);
