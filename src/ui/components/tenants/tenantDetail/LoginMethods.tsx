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

import TabSelector from "@shared/components/tabSelector";
import { Badge, Callout, Flex, Switch, Text } from "@radix-ui/themes";
import ItemLabel from "@shared/components/itemLabel";

import { getImageUrl } from "@utils";

import styles from "./LoginMethods.module.scss";

const LOGIN_METHODS = [
	{
		id: "email-password",
		name: "Email Password",
		description: "Traditional email and password authentication",
	},
	{
		id: "passwordless",
		name: "Passwordless",
		description: "Authentication without a password",
	},
	{
		id: "third-party",
		name: "Third Party",
		description: "Authentication using third party providers",
	},
	{
		id: "totp",
		name: "TOTP",
		description: "Authentication using TOTP",
	},
	{
		id: "otp-email",
		name: "OTP Email",
		description: "Authentication using OTP sent to email",
	},
	{
		id: "otp-phone",
		name: "OTP Phone",
		description: "Authentication using OTP sent to phone",
	},
];

export const LoginMethods = () => {
	const selectedMethods: string[] = [];
	return (
		<Flex
			width="100%"
			direction="column"
			className={styles["login-methods"]}>
			<TabSelector.ContentHeading>
				<ItemLabel>The login methods you wish to activate for the tenant</ItemLabel>
			</TabSelector.ContentHeading>
			<Flex
				className={styles["login-methods__content"]}
				width="100%"
				p="4"
				gap="3">
				<Flex
					className={styles["login-methods__content__main"]}
					direction="column">
					{LOGIN_METHODS.map((method) => (
						<Flex
							justify="between"
							key={method.id}
							className={styles["login-methods__content__main__item"]}
							align="center"
							mx="4"
							py="4">
							<Flex
								direction="column"
								gap="1">
								<Text
									size="2"
									weight="medium"
									className={styles["login-methods__content__main__item__name"]}>
									{method.name}
								</Text>
								<Text
									size="2"
									weight="regular"
									className={styles["login-methods__content__main__item__description"]}>
									{method.description}
								</Text>
							</Flex>
							<Switch
								size="2"
								variant="classic"
								className={styles["login-methods__content__main__method__switch"]}
							/>
						</Flex>
					))}
				</Flex>
				<Flex className={styles["login-methods__content__preview"]}>
					<Badge
						size="1"
						variant="solid"
						radius="small"
						className={styles["login-methods__content__preview__badge"]}>
						Preview
					</Badge>
					{selectedMethods.length === 0 && (
						<Flex
							gap="2"
							direction="column"
							justify="center"
							align="center"
							className={styles["login-methods__content__preview__empty"]}>
							<img
								src={getImageUrl("shield.svg")}
								alt="Shield"
								width="14px"
								height="14px"
							/>
							<Text
								size="1"
								weight="regular"
								className={styles["login-methods__content__preview__empty__text"]}>
								Select login methods to see preview
							</Text>
						</Flex>
					)}
				</Flex>
			</Flex>
			<Flex
				className={styles["login-methods__footer"]}
				px="4"
				pb="4"
				width="100%">
				<Callout.Root
					color="green"
					size="1"
					className={styles["login-methods__footer__callout"]}>
					<Text
						size="2"
						className={styles["login-methods__footer__callout__text"]}>
						<span>2 login methods enabled:</span> Users will be able to sign up using any of the selected
						methods
					</Text>
				</Callout.Root>
			</Flex>
		</Flex>
	);
};
