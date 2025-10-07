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

import { Badge, Flex, Switch, Text } from "@radix-ui/themes";

import type { TenantInfo } from "@api/tenants/types";
import { SECONDARY_FACTOR_IDS } from "@constants";
import { getImageUrl } from "@shared/utils/index";
import TabSelector from "@shared/components/tabSelector";
import ItemLabel from "@shared/components/itemLabel";

import styles from "./SecondaryFactors.module.scss";

export const SecondaryFactors = ({ tenantInfo }: { tenantInfo: TenantInfo }) => {
	const requiredSecondaryFactors = tenantInfo.requiredSecondaryFactors || [];

	return (
		<Flex
			width="100%"
			direction="column"
			className={styles["secondary-factors"]}>
			<TabSelector.ContentHeading>
				<ItemLabel>
					The secondary factors necessary for successful authentication for this tenant post-login.
				</ItemLabel>
			</TabSelector.ContentHeading>
			<Flex
				className={styles["secondary-factors__content"]}
				width="100%"
				p="4"
				gap="3">
				<Flex
					className={styles["secondary-factors__content__main"]}
					direction="column">
					{SECONDARY_FACTOR_IDS.map((factor) => {
						const isRequired = requiredSecondaryFactors.includes(factor.id);
						return (
							<Flex
								justify="between"
								key={factor.id}
								className={styles["secondary-factors__content__main__item"]}
								align="center"
								mx="4"
								py="4">
								<Flex
									direction="column"
									gap="1">
									<Text
										size="2"
										weight="medium"
										className={styles["secondary-factors__content__main__item__name"]}>
										{factor.label}
									</Text>
									<Text
										size="2"
										weight="regular"
										className={styles["secondary-factors__content__main__item__description"]}>
										{factor.description}
									</Text>
								</Flex>
								<Switch
									size="2"
									variant="classic"
									checked={isRequired}
									disabled
									className={styles["secondary-factors__content__main__method__switch"]}
								/>
							</Flex>
						);
					})}
				</Flex>
				<Flex className={styles["secondary-factors__content__preview"]}>
					<Badge
						size="1"
						variant="solid"
						radius="small"
						className={styles["secondary-factors__content__preview__badge"]}>
						Preview
					</Badge>
					{requiredSecondaryFactors.length === 0 && (
						<Flex
							gap="2"
							direction="column"
							justify="center"
							align="center"
							className={styles["secondary-factors__content__preview__empty"]}>
							<img
								src={getImageUrl("shield.svg")}
								alt="Shield"
								width="14px"
								height="14px"
							/>
							<Text
								size="1"
								weight="regular"
								className={styles["secondary-factors__content__preview__empty__text"]}>
								Select secondary factor to see preview
							</Text>
						</Flex>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
};
