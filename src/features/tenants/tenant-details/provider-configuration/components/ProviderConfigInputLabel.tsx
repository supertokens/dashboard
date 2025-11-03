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

import { Flex, Text, Tooltip } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import styles from "../ProviderConfiguration.module.scss";

interface ProviderConfigInputLabelProps {
	label: string;
	withIcon?: boolean;
	required?: boolean;
	tooltip?: string;
}

export const ProviderConfigInputLabel = ({
	label,
	withIcon = true,
	required = false,
	tooltip,
}: ProviderConfigInputLabelProps) => {
	const content = (
		<Flex
			align="center"
			gap="2"
			className={styles["provider-config-input-label"]}>
			{withIcon && (
				<InfoCircledIcon
					width={16}
					height={16}
					className={styles["provider-config-input-label__icon"]}
				/>
			)}
			<Text
				size="2"
				weight="regular"
				className={styles["provider-config-input-label__text"]}>
				{label}
				{required && (
					<Text
						size="2"
						weight="regular"
						color="red">
						*
					</Text>
				)}
				:
			</Text>
		</Flex>
	);

	if (tooltip) {
		return <Tooltip content={<Text size="2">{tooltip}</Text>}>{content}</Tooltip>;
	}

	return content;
};
