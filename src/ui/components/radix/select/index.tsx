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

import { Select as RadixSelect } from "@radix-ui/themes";

type SelectProps = {
	items: { value: string; label: string }[];
	defaultValue?: string;
	onValueChange: (value: string) => void;
	selectedValue: string;
	triggerClassName?: string;
	contentClassName?: string;
};

export default function Select({
	items,
	defaultValue,
	onValueChange,
	selectedValue,
	triggerClassName,
	contentClassName,
}: SelectProps) {
	return (
		<RadixSelect.Root
			defaultValue={defaultValue || items.length > 0 ? items[0].value : undefined}
			value={selectedValue}
			onValueChange={onValueChange}>
			<RadixSelect.Trigger className={triggerClassName} />
			<RadixSelect.Content className={contentClassName}>
				{items.map((item) => (
					<RadixSelect.Item
						value={item.value}
						key={item.value}>
						{item.label}
					</RadixSelect.Item>
				))}
			</RadixSelect.Content>
		</RadixSelect.Root>
	);
}
