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

import "./button.scss";

type ButtonProps = {
	color?: "primary" | "secondary" | "danger" | "outline" | "danger-outline";
	size?: "sm" | "md" | "lg";
} & JSX.IntrinsicElements["button"];

export default function Button(props: ButtonProps) {
	const { color = "primary", size = "md", className = "", children, ...rest } = props;
	return (
		<button
			className={`btn ${size} ${color}`}
			{...rest}>
			{children}
		</button>
	);
}
