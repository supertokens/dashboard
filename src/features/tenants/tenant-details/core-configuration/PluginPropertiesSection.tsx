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
import { Flex, Text } from "@radix-ui/themes";

import type { CoreConfigFieldInfo } from "@api/tenants/types";

import { EditPluginPropertyModal } from "@features/tenants/modals";

import CoreConfigurationTable from "./CoreConfigurationTable";

import styles from "./PluginPropertiesSection.module.scss";

interface PluginPropertiesSectionProps {
	tenantId: string;
	pluginProperties: CoreConfigFieldInfo[];
	databaseType: "postgres" | "mysql" | null;
}

export default function PluginPropertiesSection({
	tenantId,
	pluginProperties,
	databaseType,
}: PluginPropertiesSectionProps) {
	const [showPluginDialog, setShowPluginDialog] = useState(false);

	return (
		<Flex
			direction="column"
			gap="3">
			<Flex
				direction="column"
				gap="2"
				m="4"
				className={styles["plugin-properties-section"]}>
				<Text
					size="4"
					weight="bold"
					className={styles["plugin-properties-section__title"]}>
					Database Properties
				</Text>
				<Text
					size="2"
					className={styles["plugin-properties-section__description"]}>
					Some of these properties need to be modified together, hence they cannot be directly modified from
					the UI, instead you can make an API request to core to modify these properties.{" "}
					<strong
						onClick={() => setShowPluginDialog(true)}
						className={styles["plugin-properties-section__link"]}>
						Click here
					</strong>{" "}
					to see an example.
				</Text>
			</Flex>

			<CoreConfigurationTable
				tenantId={tenantId}
				coreConfig={pluginProperties}
			/>

			{showPluginDialog && databaseType !== null && (
				<EditPluginPropertyModal
					open={showPluginDialog}
					handleClose={() => setShowPluginDialog(false)}
					tenantId={tenantId}
					databaseType={databaseType}
				/>
			)}
		</Flex>
	);
}
