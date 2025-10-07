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

import { Flex } from "@radix-ui/themes";

import { ProviderConfigInputLabel } from "./ProviderConfigInputLabel";
import { ProviderConfigInputRow } from "./ProviderConfigInputRow";
import styles from "../ProviderConfiguration.module.scss";

interface UserInfoMapValue {
	userId?: string;
	email?: string;
	emailVerified?: string;
}

interface UserInfoMapChangeParams {
	name: "fromIdTokenPayload" | "fromUserInfoAPI";
	key: string;
	value: string;
}

interface UserInfoMapSectionProps {
	label: string;
	tooltip: string;
	name: "fromIdTokenPayload" | "fromUserInfoAPI";
	value: UserInfoMapValue;
	handleChange: (params: UserInfoMapChangeParams) => void;
	disabled?: boolean;
	isOverridden?: boolean;
}

const OVERRIDE_MESSAGE = "Cannot edit this because you have provided a custom override";

export const UserInfoMapSection = ({
	label,
	tooltip,
	name,
	value,
	handleChange,
	disabled,
	isOverridden = false,
}: UserInfoMapSectionProps) => (
	<Flex
		direction="column"
		gap="2"
		style={{ width: "100%" }}>
		<ProviderConfigInputLabel
			label={label}
			tooltip={tooltip}
		/>
		<Flex
			direction="column"
			gap="3"
			p="3"
			className={styles["provider-config-user-info"]}>
			<ProviderConfigInputRow
				label="userId"
				withIcon={false}
				disabled={disabled}
				value={isOverridden ? OVERRIDE_MESSAGE : value.userId}
				onChange={(e) => handleChange({ name, key: "userId", value: e.target.value })}
			/>
			<ProviderConfigInputRow
				label="email"
				withIcon={false}
				disabled={disabled}
				value={isOverridden ? OVERRIDE_MESSAGE : value.email}
				onChange={(e) => handleChange({ name, key: "email", value: e.target.value })}
			/>
			<ProviderConfigInputRow
				label="emailVerified"
				withIcon={false}
				disabled={disabled}
				value={isOverridden ? OVERRIDE_MESSAGE : value.emailVerified}
				onChange={(e) => handleChange({ name, key: "emailVerified", value: e.target.value })}
			/>
		</Flex>
	</Flex>
);
