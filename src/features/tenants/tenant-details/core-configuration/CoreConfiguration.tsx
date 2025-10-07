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

import { useMemo, useState } from "react";
import { Flex } from "@radix-ui/themes";

import type { CoreConfigFieldInfo } from "@api/tenants/types";
import { assertNever } from "@shared/utils/assertNever";
import ItemLabel from "@shared/components/itemLabel";
import TabSelector from "@shared/components/tabSelector";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";

import CoreConfigurationTable from "./CoreConfigurationTable";
import PluginPropertiesSection from "./PluginPropertiesSection";

interface CoreConfigurationProps {
	tenantId: string;
	coreConfig: CoreConfigFieldInfo[];
}

/**
 * Main component for displaying and managing core configuration properties.
 * Separates regular properties from plugin (database) properties and displays
 * them in different sections.
 */
function CoreConfiguration({ tenantId, coreConfig }: CoreConfigurationProps) {
	const [state] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");

	// Filter and detect properties - memoized to avoid recalculation on every render
	const { regularProperties, pluginProperties, hasPluginProperties, databaseType } = useMemo(() => {
		const regular = coreConfig.filter((config) => !config.isPluginProperty);
		const plugin = coreConfig.filter((config) => config.isPluginProperty);
		const hasPlugin = plugin.length > 0;

		// Detect database type from plugin properties
		let dbType: "postgres" | "mysql" | null = null;
		if (hasPlugin) {
			if (plugin.some((property) => property.key.startsWith("postgresql_"))) {
				dbType = "postgres";
			} else if (plugin.some((property) => property.key.startsWith("mysql_"))) {
				dbType = "mysql";
			}
		}

		return {
			regularProperties: regular,
			pluginProperties: plugin,
			hasPluginProperties: hasPlugin,
			databaseType: dbType,
		};
	}, [coreConfig]);

	switch (state) {
		case "LOADING":
			return <Loader type="list" />;
		case "SUCCESS":
			return (
				<Flex
					width="100%"
					direction="column">
					<TabSelector.ContentHeading>
						<ItemLabel>
							Customize the SuperTokens core settings that you want to use for your tenant.
						</ItemLabel>
					</TabSelector.ContentHeading>

					{/* Regular Properties Table */}
					<CoreConfigurationTable
						tenantId={tenantId}
						coreConfig={regularProperties}
					/>

					{/* Plugin Properties Section */}
					{hasPluginProperties && (
						<PluginPropertiesSection
							tenantId={tenantId}
							pluginProperties={pluginProperties}
							databaseType={databaseType}
						/>
					)}
				</Flex>
			);
		case "ERROR":
			return <DashboardError />;
		default:
			return assertNever(state);
	}
}

export default CoreConfiguration;
