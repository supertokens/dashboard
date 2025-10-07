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

import { useState } from "react";
import { Checkbox, Flex, Select, Switch, Text } from "@radix-ui/themes";

import type { CoreConfigFieldInfo } from "@api/tenants/types";
import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import ItemLabel from "@shared/components/itemLabel";
import ItemValue from "@shared/components/itemValue";
import TextField from "@shared/components/text";
import Callout from "@shared/components/callout";
import Button from "@shared/components/button";
import { useToast } from "@shared/components/toast";
import { useTenantDetails } from "@features/tenants/hooks/useTenantDetails";

import styles from "./EditConfigurationPropertyModal.module.scss";

interface EditConfigurationPropertyModalProps {
	open: boolean;
	handleClose: () => void;
	config: CoreConfigFieldInfo;
	tenantId: string;
}

export default function EditConfigurationPropertyModal({
	open,
	handleClose,
	config,
	tenantId,
}: EditConfigurationPropertyModalProps) {
	const [currentValue, setCurrentValue] = useState<string | number | boolean | null>(config.value);
	const [isLoading, setIsLoading] = useState(false);
	const { updateCoreConfig, refetch } = useTenantDetails(tenantId);
	const { showSuccessToast, showErrorToast } = useToast();

	const isMultiValue = Array.isArray(config.possibleValues) && config.possibleValues.length > 0;

	const toggleNull = () => {
		if (currentValue === null) {
			// Restore to default value or appropriate zero value
			if (config.valueType === "number") {
				setCurrentValue(config.defaultValue !== null ? config.defaultValue : 0);
			} else if (config.valueType === "boolean") {
				setCurrentValue(config.defaultValue !== null ? config.defaultValue : false);
			} else {
				setCurrentValue(config.defaultValue !== null ? config.defaultValue : "");
			}
		} else {
			setCurrentValue(null);
		}
	};

	const handleSaveProperty = async () => {
		try {
			setIsLoading(true);

			// Parse value based on type
			let parsedValue: string | number | boolean | null = currentValue;

			if (config.valueType === "number" && typeof currentValue === "string") {
				parsedValue = parseInt(currentValue, 10);
				if (isNaN(parsedValue as number)) {
					showErrorToast("Invalid Value", "Please enter a valid number");
					setIsLoading(false);
					return;
				}
			}

			await updateCoreConfig({
				name: config.key,
				value: parsedValue,
			});

			await refetch();
			showSuccessToast("Success", `Property "${config.key}" updated successfully`);
			handleClose();
		} catch (e: unknown) {
			const errorMessage = e instanceof Error ? e.message : "Something went wrong. Please try again.";
			showErrorToast("Update Failed", errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const renderValueInput = () => {
		// Multi-value select (dropdown)
		if (isMultiValue && config.possibleValues) {
			return (
				<Select.Root
					value={currentValue as string}
					onValueChange={(value) => setCurrentValue(value)}
					disabled={currentValue === null}>
					<Select.Trigger />
					<Select.Content>
						{config.possibleValues.map((option) => (
							<Select.Item
								key={option}
								value={option}>
								{option}
							</Select.Item>
						))}
					</Select.Content>
				</Select.Root>
			);
		}

		// Boolean type - use switch
		if (config.valueType === "boolean") {
			if (currentValue === null) {
				return (
					<Text
						size="2"
						color="gray">
						[null]
					</Text>
				);
			}
			return (
				<Flex
					align="center"
					gap="2">
					<Switch
						checked={currentValue as boolean}
						onCheckedChange={(checked) => setCurrentValue(checked)}
					/>
					<Text size="2">{currentValue ? "True" : "False"}</Text>
				</Flex>
			);
		}

		// String or number type - use text field
		return (
			<TextField
				value={currentValue === null ? "" : String(currentValue)}
				onChange={(e) => {
					const value = e.target.value;
					setCurrentValue(value);
				}}
				placeholder={currentValue === null ? "[null]" : ""}
				disabled={currentValue === null}
				color="gray"
				size="3"
				variant="surface"
				className={styles["edit-configuration-property-modal__value"]}
			/>
		);
	};

	return (
		<Modal
			size="md"
			open={open}
			handleClose={handleClose}
			title="Edit Property">
			<Form className={styles["edit-configuration-property-modal"]}>
				<Flex
					py="4"
					px="3"
					className={styles["edit-configuration-property-modal__heading"]}>
					<ItemLabel
						size="2"
						mr="2"
						weight="medium"
						className={styles["edit-configuration-property-modal__heading__label"]}>
						Property Name:
					</ItemLabel>
					<ItemValue
						size="2"
						className={styles["edit-configuration-property-modal__heading__value"]}>
						{config.key}
					</ItemValue>
				</Flex>
				<Flex
					direction="column"
					gap="4"
					px="3"
					pb="3">
					<Form.Item>
						<ItemLabel
							size="2"
							weight="medium"
							mb="2">
							Value:
						</ItemLabel>
						{renderValueInput()}
						{config.isNullable && (
							<Flex
								mt="2"
								align="center"
								gap="2">
								<Checkbox
									checked={currentValue === null}
									onCheckedChange={toggleNull}
								/>
								<Text size="2">Set value as null</Text>
							</Flex>
						)}
					</Form.Item>
					{config.description && (
						<Callout
							color="gray"
							className={styles["edit-configuration-property-modal__callout"]}>
							<Text className={styles["edit-configuration-property-modal__callout__text"]}>
								{config.description}
							</Text>
							{config.defaultValue !== null && (
								<Text
									mt="3"
									className={styles["edit-configuration-property-modal__callout__text--bold"]}>
									Default Value: {String(config.defaultValue)}
								</Text>
							)}
						</Callout>
					)}
				</Flex>
			</Form>
			<Flex
				justify="end"
				mt="5">
				<Button
					size="3"
					onClick={handleSaveProperty}
					disabled={isLoading}>
					{isLoading ? "Saving..." : "Save"}
				</Button>
			</Flex>
		</Modal>
	);
}
