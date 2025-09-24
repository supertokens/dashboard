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
import { Callout as RadixCallout } from "@radix-ui/themes";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import "./index.scss";

type CalloutType = "warning" | "info" | "success" | "error";

const getIcon = (type?: CalloutType) => {
	switch (type) {
		case "warning":
			return <ExclamationTriangleIcon className="callout__icon" />;
		default:
			return <InfoCircledIcon className="callout__icon" />;
	}
};

export default function Callout({
	children,
	type = "info",
	className,
	...props
}: RadixCallout.RootProps & {
	children: React.ReactNode;
	type?: CalloutType;
	className?: string;
} & RadixCallout.RootProps) {
	return (
		<RadixCallout.Root
			variant="soft"
			className={`callout callout--${type} ${className}`}
			{...props}>
			<RadixCallout.Icon>{getIcon(type)}</RadixCallout.Icon>
			<RadixCallout.Text>{children}</RadixCallout.Text>
		</RadixCallout.Root>
	);
}
