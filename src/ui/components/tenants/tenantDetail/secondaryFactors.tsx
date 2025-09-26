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

import TabSelector from "@components/radix/tabSelector";
import { Badge, Flex, Switch, Text } from "@radix-ui/themes";
import ItemLabel from "@components/radix/itemLabel";

import "./secondaryFactors.scss";
import { getImageUrl } from "@utils/index";

const SECONDARY_FACTORS = [
	{
		id: "totp",
		name: "TOTP",
		description: "Time-based one-time passwords using apps like Google Authenticator",
	},
	{
		id: "OTP-Email",
		name: "OTP Via Email",
		description: "One-time password sent to user's email address without a password",
	},
	{
		id: "OTP-Phone",
		name: "OTP Via Phone",
		description: "One-time password sent to user's phone number without a password",
	},
];

export const SecondaryFactors = () => {
	const selectedMethods: string[] = [];
	return (
		<Flex
			width="100%"
			direction="column"
			className="secondary-factors">
			<TabSelector.ContentHeading>
				<ItemLabel>
					The secondary factors necessary for successful authentication for this tenant post-login.
				</ItemLabel>
			</TabSelector.ContentHeading>
			<Flex
				className="secondary-factors__content"
				width="100%"
				p="4"
				gap="3">
				<Flex
					className="secondary-factors__content__main"
					direction="column">
					{SECONDARY_FACTORS.map((factor) => (
						<Flex
							justify="between"
							key={factor.id}
							className="secondary-factors__content__main__item"
							align="center"
							mx="4"
							py="4">
							<Flex
								direction="column"
								gap="1">
								<Text
									size="2"
									weight="medium"
									className="secondary-factors__content__main__item__name">
									{factor.name}
								</Text>
								<Text
									size="2"
									weight="regular"
									className="secondary-factors__content__main__item__description">
									{factor.description}
								</Text>
							</Flex>
							<Switch
								size="2"
								variant="classic"
								className="secondary-factors__content__main__method__switch"
							/>
						</Flex>
					))}
				</Flex>
				<Flex className="secondary-factors__content__preview">
					<Badge
						size="1"
						variant="solid"
						radius="small"
						className="secondary-factors__content__preview__badge">
						Preview
					</Badge>
					{selectedMethods.length === 0 && (
						<Flex
							gap="2"
							direction="column"
							justify="center"
							align="center"
							className="secondary-factors__content__preview__empty">
							<img
								src={getImageUrl("shield.svg")}
								alt="Shield"
								width="14px"
								height="14px"
							/>
							<Text
								size="1"
								weight="regular"
								className="secondary-factors__content__preview__empty__text">
								Select secondary factor to see preview
							</Text>
						</Flex>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
};
