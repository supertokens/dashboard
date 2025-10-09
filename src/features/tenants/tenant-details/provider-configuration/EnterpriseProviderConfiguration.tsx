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

import { Badge, Flex, Text, TextField } from "@radix-ui/themes";
import Button from "@shared/components/button";

import styles from "./EnterpriseProviderConfiguration.module.scss";

const ProviderSetup = ({
	handleCancel,
	handleContinue,
	providerName,
	providerIcon,
	formLabel,
	formTitle,
	formFooter,
}: {
	handleCancel: () => void;
	handleContinue: () => void;
	providerName: string;
	providerIcon: string;
	formLabel: string;
	formTitle: string;
	formFooter: string;
}) => {
	return (
		<Flex
			className="provider-setup"
			direction="column">
			<Flex
				justify="between"
				align="center"
				className={styles["provider-setup__header"]}
				p="3">
				<Flex
					gap="3"
					align="center">
					<Text
						size="2"
						className={styles["provider-setup__header__title"]}>
						Configure new provider
					</Text>
					<Badge
						size="2"
						color="gray"
						className={styles["provider-setup__header__badge"]}>
						<img
							src={providerIcon}
							alt={providerName}
							width="16px"
							height="16px"
						/>
						<Text
							size="2"
							weight="medium"
							className={styles["provider-setup__header__badge__text"]}>
							{providerName}
						</Text>
					</Badge>
				</Flex>
				<Flex
					align="center"
					gap="2">
					<Button
						size="2"
						variant="outline"
						color="gray"
						onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						size="2"
						onClick={handleContinue}>
						Continue
					</Button>
				</Flex>
			</Flex>
			<Flex
				direction="column"
				className={styles["provider-setup__main"]}
				p="3">
				<Text
					size="2"
					className={styles["provider-setup__main__title"]}>
					{formTitle}
				</Text>
				<Flex
					className={styles["provider-setup__main__form"]}
					width="100%"
					align="center"
					gap="3">
					<Text
						size="2"
						weight="medium"
						className={styles["provider-setup__main__form__label"]}>
						{formLabel}
					</Text>
					<TextField.Root
						size="3"
						variant="surface"
						className={styles["provider-setup__main__form__input"]}
					/>
				</Flex>
				<Text
					size="2"
					weight="regular"
					className={styles["provider-setup__main__footer"]}>
					{formFooter}
				</Text>
			</Flex>
		</Flex>
	);
};
