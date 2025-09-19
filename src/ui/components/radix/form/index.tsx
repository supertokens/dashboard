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
import "./index.scss";
import { Flex } from "@radix-ui/themes";

export default function Form({
	children,
	...props
}: { children: React.ReactNode } & React.FormHTMLAttributes<HTMLFormElement>) {
	return (
		<form
			className="form"
			{...props}>
			{children}
		</form>
	);
}

Form.Item = function FormItem({ children }: { children: React.ReactNode }) {
	return (
		<Flex
			direction="column"
			className="form-item">
			{children}
		</Flex>
	);
};
