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

import styles from "./index.module.scss";
import { getImageUrl } from "@shared/utils";
import { SECONDARY_FACTOR_IDS } from "@shared/constants";

type SecondaryFactor = "totp" | "otp-email" | "otp-phone";

interface SecondFactorPreviewProps {
	secondaryFactors: SecondaryFactor[];
}

const SecondFactorPreviewItem = ({ factor }: { factor: SecondaryFactor }) => {
	return (
		<Flex
			gap="4"
			align="start"
			className={styles["second-factor-preview__item"]}>
			<img
				src={getImageUrl(`${factor}.svg`)}
				alt={factor}
			/>
			<Flex
				direction="column"
				gap="2"
				className={styles["second-factor-preview__item__content"]}>
				<Text className={styles["second-factor-preview__item__content__label"]}>
					{SECONDARY_FACTOR_IDS.find((f) => f.id === factor)?.label}
				</Text>
				<Text className={styles["second-factor-preview__item__content__description"]}>
					{SECONDARY_FACTOR_IDS.find((f) => f.id === factor)?.description}
				</Text>
			</Flex>
		</Flex>
	);
};

export const SecondFactorPreview = ({ secondaryFactors }: SecondFactorPreviewProps) => {
	return (
		<Flex
			direction="column"
			className={styles["second-factor-preview"]}>
			<Text className={styles["second-factor-preview__title"]}>Please select a factor</Text>
			<Flex
				direction="column"
				gap="3">
				{secondaryFactors.map((factor) => (
					<SecondFactorPreviewItem
						key={factor}
						factor={factor}
					/>
				))}
			</Flex>
			<Flex
				justify="end"
				align="center"
				gap="2"
				mt="5"
				className={styles["second-factor-preview__footer"]}>
				<img
					src={getImageUrl("back-arrow.svg")}
					alt="back"
				/>
				Log out
			</Flex>
		</Flex>
	);
};
