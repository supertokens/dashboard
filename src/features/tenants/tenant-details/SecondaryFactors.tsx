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
import { Badge, Callout, Flex, Link, Switch, Text } from "@radix-ui/themes";

import type { TenantInfo } from "@api/tenants/types";
import { SECONDARY_FACTOR_IDS } from "@shared/constants";
import { getImageUrl } from "@shared/utils/index";
import TabSelector from "@shared/components/tabSelector";
import ItemLabel from "@shared/components/itemLabel";
import { useToast } from "@shared/components/toast";

import { useTenantDetails } from "../hooks/useTenantDetails";
import styles from "./SecondaryFactors.module.scss";

type MFAError = null | "MFA_NOT_INITIALIZED" | "MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN";

export const SecondaryFactors = ({ tenantInfo }: { tenantInfo: TenantInfo }) => {
	const requiredSecondaryFactors = tenantInfo.requiredSecondaryFactors || [];
	const [mfaError, setMfaError] = useState<MFAError>(null);

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

			{mfaError === "MFA_NOT_INITIALIZED" && (
				<Callout.Root
					color="red"
					size="1"
					my="3"
					mx="4">
					<Callout.Text size="2">
						You need to initialize the MFA recipe to use secondary factors.{" "}
						<Link
							href="https://supertokens.com/docs/mfa/backend-setup"
							target="_blank"
							rel="noreferrer noopener"
							className={styles["secondary-factors__callout__link"]}>
							Click here
						</Link>{" "}
						to see MFA docs for more info.
					</Callout.Text>
				</Callout.Root>
			)}

			{mfaError === "MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN" && (
				<Callout.Root
					color="yellow"
					size="1"
					my="3"
					mx="4">
					<Callout.Text size="2">
						Please note that the MFA functions are overridden in the SDK and the required secondary factors
						settings will be based on the overridden logic.
					</Callout.Text>
				</Callout.Root>
			)}

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
							<SecondaryFactorItem
								key={factor.id}
								factorId={factor.id}
								label={factor.label}
								description={factor.description}
								isRequired={isRequired}
								tenantId={tenantInfo.tenantId}
								setMfaError={setMfaError}
							/>
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

interface SecondaryFactorItemProps {
	factorId: string;
	label: string;
	description: string;
	isRequired: boolean;
	tenantId: string;
	setMfaError: (error: MFAError) => void;
}

const SecondaryFactorItem = ({
	factorId,
	label,
	description,
	isRequired,
	tenantId,
	setMfaError,
}: SecondaryFactorItemProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { updateRequiredSecondaryFactor } = useTenantDetails(tenantId);
	const { showErrorToast } = useToast();

	const handleToggle = async () => {
		try {
			setIsLoading(true);
			const response = await updateRequiredSecondaryFactor({ factorId, enable: !isRequired });

			if (response.status !== "OK") {
				if (response.status === "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR") {
					setError(response.message);
				} else if (response.status === "MFA_NOT_INITIALIZED_ERROR") {
					setMfaError("MFA_NOT_INITIALIZED");
				} else {
					throw new Error(response.status);
				}
			} else {
				if (response.isMFARequirementsForAuthOverridden) {
					setMfaError("MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN");
				} else {
					setError(null);
				}
			}

			// If this is not a MFA related error then clear the error
			if (
				(response.status === "OK" && !response.isMFARequirementsForAuthOverridden) ||
				response.status === "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR"
			) {
				setMfaError(null);
			}
		} catch (error) {
			const errorMessage = (error as Error).message;
			showErrorToast(errorMessage === "UNKNOWN_TENANT_ERROR" ? "Tenant does not exist" : "Something went wrong!");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Flex direction="column">
			<Flex
				justify="between"
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
						{label}
					</Text>
					<Text
						size="2"
						weight="regular"
						className={styles["secondary-factors__content__main__item__description"]}>
						{description}
					</Text>
					{error && (
						<Text
							size="1"
							style={{ color: "var(--red-9)" }}>
							⚠️ {error}
						</Text>
					)}
				</Flex>
				<Switch
					size="2"
					variant="classic"
					checked={isRequired}
					disabled={isLoading}
					onCheckedChange={handleToggle}
					className={styles["secondary-factors__content__main__method__switch"]}
				/>
			</Flex>
		</Flex>
	);
};
