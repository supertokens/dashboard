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

import { useState } from "react";
import { Badge, Callout, Flex, Switch, Text } from "@radix-ui/themes";

import type { TenantInfo } from "@api/tenants/types";
import { FIRST_FACTOR_IDS } from "@shared/constants";
import { getImageUrl } from "@shared/utils";
import TabSelector from "@shared/components/tabSelector";
import ItemLabel from "@shared/components/itemLabel";
import { useToast } from "@shared/components/toast";

import { useTenantDetails } from "../hooks/useTenantDetails";
import styles from "./LoginMethods.module.scss";
import { SupertokensPreview } from "@shared/components/supertokens-preview";

export const LoginMethods = ({ tenantInfo }: { tenantInfo: TenantInfo }) => {
	const enabledFirstFactors = tenantInfo.firstFactors || [];

	return (
		<Flex
			width="100%"
			direction="column"
			className={styles["login-methods"]}>
			<TabSelector.ContentHeading>
				<ItemLabel>The login methods you wish to activate for the tenant</ItemLabel>
			</TabSelector.ContentHeading>

			{enabledFirstFactors.length === 0 && (
				<Callout.Root
					color="red"
					size="1"
					my="3"
					mx="4">
					<Callout.Text size="2">
						At least one login method needs to be enabled for the user to log in to the tenant.
					</Callout.Text>
				</Callout.Root>
			)}

			<Flex
				className={styles["login-methods__content"]}
				width="100%"
				p="4"
				gap="3">
				<Flex
					className={styles["login-methods__content__main"]}
					direction="column">
					{FIRST_FACTOR_IDS.map((factor) => {
						const isEnabled = enabledFirstFactors.includes(factor.id);
						return (
							<LoginMethodItem
								key={factor.id}
								factorId={factor.id}
								label={factor.label}
								description={factor.description}
								isEnabled={isEnabled}
								tenantId={tenantInfo.tenantId}
							/>
						);
					})}
				</Flex>
				<Flex className={styles["login-methods__content__preview"]}>
					<Badge
						size="1"
						variant="solid"
						radius="small"
						className={styles["login-methods__content__preview__badge"]}>
						Preview
					</Badge>
					{enabledFirstFactors.length === 0 ? (
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
					) : (
						<Flex
							justify="center"
							align="center"
							className={styles["login-methods__content__preview__supertokens-preview"]}>
							<SupertokensPreview enabledFirstFactors={enabledFirstFactors} />
						</Flex>
					)}
				</Flex>
			</Flex>
			{enabledFirstFactors.length > 0 && (
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
							<span>{enabledFirstFactors.length} login methods enabled:</span> Users will be able to sign
							up using any of the selected methods
						</Text>
					</Callout.Root>
				</Flex>
			)}
		</Flex>
	);
};

interface LoginMethodItemProps {
	factorId: string;
	label: string;
	description: string;
	isEnabled: boolean;
	tenantId: string;
}

const LoginMethodItem = ({ factorId, label, description, isEnabled, tenantId }: LoginMethodItemProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const { showErrorToast } = useToast();
	const [error, setError] = useState<
		"RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR" | "UNKNOWN_TENANT_ERROR" | "GENERIC_ERROR" | null
	>(null);
	const { updateFirstFactor } = useTenantDetails(tenantId);

	const handleToggle = async () => {
		try {
			setIsLoading(true);
			const response = await updateFirstFactor({ factorId, enable: !isEnabled });

			if (response.status !== "OK") {
				if (response.status === "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR") {
					setError("RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR");
				} else if (response.status === "UNKNOWN_TENANT_ERROR") {
					setError("UNKNOWN_TENANT_ERROR");
					showErrorToast("Could not update login method. Tenant not found!");
				} else {
					setError("GENERIC_ERROR");
					showErrorToast("Could not update login method. Something went wrong!");
				}
			} else {
				setError(null);
			}
		} catch (error) {
			setError("GENERIC_ERROR");
			showErrorToast("Could not update login method. Something went wrong!");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Flex
			direction="column"
			className={styles["login-method-item"]}>
			<Flex
				direction="column"
				className={styles["login-method-item__container"]}>
				<Flex
					justify="between"
					className={styles["login-method-item__container__item"]}
					align="center"
					mx="4"
					py="4">
					<Flex
						direction="column"
						gap="1">
						<Text
							size="2"
							weight="medium"
							className={styles["login-method-item__container__item__name"]}>
							{label}
						</Text>
						<Text
							size="2"
							weight="regular"
							className={styles["login-method-item__container__item__description"]}>
							{description}
						</Text>
					</Flex>
					<Switch
						size="2"
						variant="classic"
						checked={isEnabled}
						disabled={isLoading}
						onCheckedChange={handleToggle}
						className={styles["login-method-item__container__method__switch"]}
					/>
				</Flex>
				{(() => {
					switch (error) {
						case "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR":
							return (
								<Text
									className={styles["login-method-item__container__error"]}
									size="1"
									weight="medium"
									color="red">
									⚠️ This login method is not configured in your backend SDK. Please check your
									configuration.
								</Text>
							);

						default:
							return null;
					}
				})()}
			</Flex>
		</Flex>
	);
};
