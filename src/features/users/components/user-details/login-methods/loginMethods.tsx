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

import { useState, useEffect, useMemo } from "react";
import { Box, Flex } from "@radix-ui/themes";

import DashboardError from "@shared/components/error";
import EmptyList from "@shared/components/empty";
import ItemLabel from "@shared/components/itemLabel";
import Loader from "@shared/components/loader";
import Select from "@shared/components/select";
import Subtitle from "@shared/components/subtitle";
import TabSelector from "@shared/components/tabSelector";

import { useUser } from "@features/users/hooks/useUser";
import { useTenants } from "@features/tenants/hooks/useTenants";
import { assertNever } from "@shared/utils/assertNever";

import LoginMethodCard from "./LoginMethodCard";

import styles from "./loginMethods.module.scss";

interface LoginMethodsProps {
	readonly userId: string;
}

export default function LoginMethods({ userId }: LoginMethodsProps) {
	const { userDetails, isLoading, error } = useUser(userId);
	const { tenants, isLoading: isLoadingTenants, selectedTenant: globalSelectedTenant } = useTenants();

	const [selectedTenantId, setSelectedTenantId] = useState<string>("");

	// Initialize from global tenant on mount, but keep it local
	useEffect(() => {
		if (globalSelectedTenant && !selectedTenantId) {
			setSelectedTenantId(globalSelectedTenant);
		}
	}, [globalSelectedTenant, selectedTenantId]);

	const user = userDetails?.status === "OK" ? userDetails.user : null;

	const loginMethods = useMemo(() => {
		if (!user || !selectedTenantId) return [];
		return user.loginMethods.filter((lm) => lm.tenantIds.includes(selectedTenantId));
	}, [user, selectedTenantId]);

	const tenantItems = useMemo(
		() =>
			tenants?.map((tenant) => ({
				label: tenant.tenantId,
				value: tenant.tenantId,
			})) || [],
		[tenants]
	);

	const viewState = useMemo(() => {
		if (error) return "ERROR";
		if (isLoading || isLoadingTenants) return "LOADING";
		if (!userDetails || userDetails.status !== "OK") return "ERROR";
		if (loginMethods.length === 0) return "EMPTY";
		return "SUCCESS";
	}, [error, isLoading, isLoadingTenants, userDetails, loginMethods.length]);

	const renderHeader = () => (
		<TabSelector.ContentHeading>
			<Flex
				className={styles["login-methods__header"]}
				justify="between"
				align="center"
				width="100%">
				<Subtitle>Login methods associated with the user</Subtitle>
				<Flex align="center">
					<ItemLabel mr="2">Select tenant:</ItemLabel>
					<Select
						items={tenantItems}
						onValueChange={setSelectedTenantId}
						selectedValue={selectedTenantId}
						triggerClassName={styles["login-methods__header__select"]}
					/>
				</Flex>
			</Flex>
		</TabSelector.ContentHeading>
	);

	return (
		<Box width="100%">
			{(() => {
				switch (viewState) {
					case "LOADING":
						return (
							<Flex
								width="100%"
								p="3">
								<Loader type="list" />
							</Flex>
						);
					case "ERROR":
						return <DashboardError withBackground={false} />;
					case "EMPTY":
						return (
							<>
								{renderHeader()}
								<EmptyList
									iconUrl="user.svg"
									title="No login methods"
									description="This user has no login methods associated with this tenant."
								/>
							</>
						);
					case "SUCCESS":
						if (!user) {
							return <DashboardError withBackground={false} />;
						}
						return (
							<>
								{renderHeader()}
								<Flex
									direction="column"
									width="100%"
									gap="3"
									className={styles["login-methods__list"]}>
									{loginMethods.map((loginMethod, index) => (
										<LoginMethodCard
											key={`${loginMethod.recipeUserId}-${index}`}
											loginMethod={loginMethod}
											userId={userId}
											user={user}
										/>
									))}
								</Flex>
							</>
						);
					default:
						assertNever(viewState);
				}
			})()}
		</Box>
	);
}
