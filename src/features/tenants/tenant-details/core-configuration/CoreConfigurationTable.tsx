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

import { Flex, Text } from "@radix-ui/themes";

import type { CoreConfigFieldInfo } from "@api/tenants/types";
import Paper from "@shared/components/paper";

import CoreConfigTableRow from "./CoreConfigTableRow";
import styles from "./CoreConfigurationTable.module.scss";

interface CoreConfigurationTableProps {
	tenantId: string;
	coreConfig: CoreConfigFieldInfo[];
}

export default function CoreConfigurationTable({ tenantId, coreConfig }: CoreConfigurationTableProps) {
	return (
		<Paper
			withBackground
			withBorder
			className={styles["core-configuration-table"]}
			m="4"
			p="0">
			<Flex
				p="3"
				align="center"
				className={styles["core-configuration-table__header"]}>
				<Text
					weight="medium"
					size="2"
					className={styles["core-configuration-table__header__property-name"]}>
					Property Name
				</Text>
				<Text
					weight="medium"
					size="2"
					className={styles["core-configuration-table__header__value"]}>
					Value
				</Text>
				<Text />
			</Flex>
			<Flex
				className={styles["core-configuration-table__body"]}
				direction="column">
				{coreConfig.map((config) => (
					<CoreConfigTableRow
						key={config.key}
						tenantId={tenantId}
						config={config}
					/>
				))}
			</Flex>
		</Paper>
	);
}
