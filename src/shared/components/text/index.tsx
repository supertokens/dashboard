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

import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Flex, Text, TextField as RadixTextField, IconButton } from "@radix-ui/themes";
import { useState } from "react";

import "./index.scss";

type TextFieldProps = React.ComponentProps<typeof RadixTextField.Root> & {
	error?: string;
	fullWidth?: boolean;
};

export default function TextField({ error, fullWidth = true, children, ...props }: TextFieldProps) {
	const [showPassword, setShowPassword] = useState(false);

	const PasswordToggleButton = () => (
		<IconButton
			onClick={() => setShowPassword(!showPassword)}
			color="gray"
			variant="soft"
			className="password-button">
			{showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
		</IconButton>
	);

	const PasswordSlot = () => (
		<RadixTextField.Slot
			side="right"
			pr="1">
			<PasswordToggleButton />
		</RadixTextField.Slot>
	);

	const getInputType = () => {
		if (props.type !== "password") return props.type;
		return showPassword ? "text" : "password";
	};

	return (
		<Flex
			direction="column"
			{...(fullWidth && { width: "100%" })}>
			<RadixTextField.Root
				{...props}
				type={getInputType()}>
				{children}
				{props.type === "password" && <PasswordSlot />}
			</RadixTextField.Root>
			{error && (
				<Text
					size="1"
					color="red"
					mt="1">
					{error}
				</Text>
			)}
		</Flex>
	);
}
