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

import { Flex, Text, Tooltip } from "@radix-ui/themes";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

import { ProviderConfigInputLabel } from "./ProviderConfigInputLabel";
import { ProviderConfigInput } from "./ProviderConfigInput";
import styles from "../ProviderConfiguration.module.scss";

interface ProviderConfigSuffixInputProps {
	baseProviderId: string;
	suffixValue: string;
	onSuffixChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onShowSuffixField: () => void;
	isSuffixFieldVisible: boolean;
	error?: string;
	disabled?: boolean;
}

export const ProviderConfigSuffixInput = ({
	baseProviderId,
	suffixValue,
	onSuffixChange,
	onShowSuffixField,
	isSuffixFieldVisible,
	error,
	disabled,
}: ProviderConfigSuffixInputProps) => {
	if (isSuffixFieldVisible) {
		// Show input field with prefix
		return (
			<Flex
				direction="column"
				gap="1"
				width="100%">
				<Flex
					align="center"
					gap="2"
					width="100%">
					<ProviderConfigInputLabel
						label="Third Party ID"
						tooltip="The ID of the provider"
						required
					/>
					<Flex
						align="center"
						gap="0"
						style={{ flex: 1 }}
						className={styles["provider-config-suffix-input--active"]}>
						<button
							type="button"
							className={styles["provider-config-suffix-input__button"]}
							disabled>
							{baseProviderId}-
						</button>
						<ProviderConfigInput
							value={suffixValue}
							onChange={onSuffixChange}
							placeholder="Enter suffix"
							disabled={disabled}
							className={styles["provider-config-input"]}
						/>
					</Flex>
				</Flex>
				{error && (
					<Text
						size="1"
						color="red"
						ml="2">
						{error}
					</Text>
				)}
			</Flex>
		);
	}

	// Show base provider ID with "+ Add suffix" button
	return (
		<Flex
			direction="column"
			gap="1"
			width="100%">
			<Flex
				align="center"
				gap="2"
				width="100%">
				<ProviderConfigInputLabel
					label="Third Party ID"
					tooltip="The ID of the provider"
					required
				/>
				<Flex
					align="center"
					gap="2"
					style={{ flex: 1 }}>
					<Text
						size="2"
						weight="medium"
						color="gray">
						{baseProviderId}
					</Text>
					<Flex
						align="center"
						gap="1"
						className={styles["provider-config-suffix-input__add-suffix"]}>
						<Text
							size="2"
							weight="medium"
							className={styles["provider-config-suffix-input__add-suffix__text"]}
							onClick={onShowSuffixField}
							style={{ cursor: "pointer" }}>
							+ Add Suffix
						</Text>
						<Tooltip content="You can add multiple providers of the same type by adding a unique suffix to the third party id.">
							<QuestionMarkCircledIcon
								width="14"
								height="14"
								style={{ color: "var(--color-neutral-11)" }}
							/>
						</Tooltip>
					</Flex>
				</Flex>
			</Flex>
			{error && (
				<Text
					size="1"
					color="red"
					ml="2">
					{error}
				</Text>
			)}
		</Flex>
	);
};
