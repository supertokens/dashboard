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

import { SegmentedControl } from "@radix-ui/themes";
import { withOverride } from "@plugins";

import styles from "./EmailSelect.module.scss";

export type EmailSelectState = "always" | "sometimes" | "never";

interface EmailSelectProps {
	value: EmailSelectState;
	setValue: (value: EmailSelectState) => void;
	disabled?: boolean;
}

export const EmailSelect = withOverride(
	"EmailSelect",
	function EmailSelect({ value, setValue, disabled }: EmailSelectProps) {
		return (
			<SegmentedControl.Root
				value={value}
				onValueChange={(val) => setValue(val as EmailSelectState)}
				size="2"
				disabled={disabled}
				className={styles["email-select"]}>
				<SegmentedControl.Item
					value="always"
					className={styles["email-select__item"]}>
					All the time
				</SegmentedControl.Item>
				<SegmentedControl.Item
					value="sometimes"
					className={styles["email-select__item"]}>
					Sometimes
				</SegmentedControl.Item>
				<SegmentedControl.Item
					value="never"
					className={styles["email-select__item"]}>
					Never
				</SegmentedControl.Item>
			</SegmentedControl.Root>
		);
	}
);
