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

import { Badge, Flex, Text } from "@radix-ui/themes";
import { ChevronRightIcon } from "@radix-ui/react-icons";

import type { Tenant } from "@api/tenants/types";

import styles from "./TenantsListItem.module.scss";
import { useNavigationHelpers } from "@shared/navigation";

interface TenantsListItemProps {
	tenant: Tenant;
}

export default function TenantsListItem({ tenant }: TenantsListItemProps) {
	const { goToTenantDetail } = useNavigationHelpers();

	return (
		<Flex
			align="center"
			width="100%"
			className={styles["tenants-list-item"]}
			onClick={() => {
				goToTenantDetail(tenant.tenantId);
			}}>
			<Text
				className={styles["tenants-list-item__tenant-id"]}
				size="3"
				weight="medium">
				{tenant.tenantId}
			</Text>
			<Flex
				className={styles["tenants-list-item__login-methods"]}
				gap="2"
				align="center">
				{tenant.firstFactors.map((factor) => (
					<Badge
						className={styles["tenants-list-item__login-methods__badge"]}
						key={factor}
						size="1"
						variant="soft"
						radius="medium">
						<Text size="2">{factor}</Text>
					</Badge>
				))}
				{tenant.firstFactors.length === 0 && (
					<Text
						size="2"
						color="gray">
						No login methods enabled for this tenant
					</Text>
				)}
			</Flex>
			<Flex
				align="center"
				justify="center"
				className={styles["tenants-list-item__chevron-right"]}>
				<ChevronRightIcon
					height={16}
					width={16}
				/>
			</Flex>
		</Flex>
	);
}
