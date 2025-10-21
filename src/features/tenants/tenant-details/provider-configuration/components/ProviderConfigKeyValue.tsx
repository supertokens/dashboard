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

import { Flex, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";

import { ProviderConfigInputLabel } from "./ProviderConfigInputLabel";
import { ProviderConfigCancelButton } from "./ProviderConfigCancelButton";
import providerStyles from "../ProviderConfiguration.module.scss";

import styles from "./ProviderConfigKeyValue.module.scss";
import { ProviderConfigInput } from "./ProviderConfigInput";
import { ProviderConfigSeparator } from "./ProviderConfigSeparator";

interface ProviderConfigKeyValueProps {
	label: string;
	tooltip?: string;
	items: [string, string | null][];
	setItems: (items: [string, string | null][]) => void;
	disabled?: boolean;
	fixedFields?: string[];
}

export const ProviderConfigKeyValue = ({
	label,
	tooltip,
	items,
	setItems,
	disabled,
	fixedFields = [],
}: ProviderConfigKeyValueProps) => {
	const handleKeyChange = (index: number, newKey: string) => {
		const newItems = [...items];
		newItems[index] = [newKey, items[index][1]];
		setItems(newItems);
	};

	const handleValueChange = (index: number, newValue: string) => {
		const newItems = [...items];
		newItems[index] = [items[index][0], newValue];
		setItems(newItems);
	};

	const handleRemoveItem = (index: number) => {
		setItems(items.filter((_, i) => i !== index));
	};

	const handleAddNewItem = () => {
		setItems([...items, ["", ""]]);
	};

	const hasOnlyOneEmptyKeyValuePair =
		items.length === 1 && items[0][0]?.trim() === "" && (items[0][1]?.trim() === "" || items[0][1] === null);

	return (
		<Flex
			direction="column"
			gap="2"
			className={styles["provider-config-key-value__container"]}>
			<ProviderConfigInputLabel
				label={label}
				tooltip={tooltip}
			/>
			<Flex
				direction="column"
				gap="2"
				p="3"
				className={providerStyles["provider-config-key-value"]}>
				{items.map((item, index) => {
					const isFieldFixed = fixedFields.includes(item[0]);
					const isFieldDisabled = disabled || isFieldFixed;
					const isDeleteDisabled = isFieldFixed || hasOnlyOneEmptyKeyValuePair;

					return (
						<Flex
							key={index}
							gap="3"
							align="center"
							py="2"
							px="3"
							className={providerStyles["provider-config-key-value__item"]}>
							<Flex
								width="100%"
								align="center">
								<Text
									size="2"
									weight="regular"
									mr="3">
									Key:
								</Text>
								<ProviderConfigInput
									disabled={isFieldDisabled}
									value={item[0]}
									onChange={(e) => handleKeyChange(index, e.target.value)}
								/>
							</Flex>
							<Flex
								width="100%"
								align="center">
								<Text
									size="2"
									weight="regular"
									mr="3">
									Value:
								</Text>
								<ProviderConfigInput
									disabled={isFieldDisabled}
									value={item[1] || ""}
									onChange={(e) => handleValueChange(index, e.target.value)}
								/>
							</Flex>

							<ProviderConfigCancelButton
								onClick={() => handleRemoveItem(index)}
								disabled={isDeleteDisabled}
							/>
						</Flex>
					);
				})}
				<ProviderConfigSeparator
					mx="0"
					my="2"
				/>
				<Button
					variant="outline"
					size="2"
					color="gray"
					onClick={handleAddNewItem}
					disabled={disabled}
					className={styles["provider-config-key-value__add-new"]}>
					<PlusIcon />
					Add New
				</Button>
			</Flex>
		</Flex>
	);
};
