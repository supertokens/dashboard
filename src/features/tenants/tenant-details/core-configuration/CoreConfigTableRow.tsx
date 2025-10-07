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
import { Badge, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { InfoCircledIcon, Pencil1Icon, QuestionMarkIcon } from "@radix-ui/react-icons";

import type { CoreConfigFieldInfo } from "@api/tenants/types";
import { PUBLIC_TENANT_ID } from "@shared/constants";
import UneditableConfigurationModal from "@features/tenants/modals/UneditableConfigurationModal";
import EditConfigurationPropertyModal from "@features/tenants/modals/EditConfigurationPropertyModal";

import { getUneditableReason } from "./CoreConfigurationUneditableReason";
import styles from "./CoreConfigTableRow.module.scss";

interface CoreConfigTableRowProps {
	tenantId: string;
	config: CoreConfigFieldInfo;
}

export default function CoreConfigTableRow({ tenantId, config }: CoreConfigTableRowProps) {
	const [isUneditableModalOpen, setIsUneditableModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const isPublicTenant = tenantId === PUBLIC_TENANT_ID;

	// Determine if the property is editable
	const isUneditable =
		isPublicTenant || // config of public tenant are not editable
		(config.isPluginProperty && !config.isPluginPropertyEditable) || // plugin property that is marked as not editable
		(!isPublicTenant && !config.isDifferentAcrossTenants); // in a non-public tenant, config that's not different across tenants are not editable

	// Display value - show the actual value, matching old implementation
	const displayValue = `${config.value}`;

	return (
		<>
			<Flex
				width="100%"
				className={styles["core-config-table-row"]}
				p="3">
				<Flex
					align="center"
					className={styles["core-config-table-row__property-name"]}
					gap="1">
					{config.description && (
						<Tooltip content={config.description}>
							<InfoCircledIcon />
						</Tooltip>
					)}
					<Text
						weight="regular"
						size="2">
						{config.key}
					</Text>
				</Flex>
				<Flex
					align="center"
					className={styles["core-config-table-row__value"]}
					justify="between">
					<Badge
						radius="large"
						className={styles["core-config-table-row__value__badge"]}>
						<Text
							weight="medium"
							size="2">
							{displayValue}
						</Text>
					</Badge>
					{isUneditable ? (
						<IconButton
							size="2"
							variant="soft"
							onClick={() => setIsUneditableModalOpen(true)}>
							<QuestionMarkIcon />
						</IconButton>
					) : (
						<IconButton
							size="2"
							variant="soft"
							color="gray"
							onClick={() => setIsEditModalOpen(true)}>
							<Pencil1Icon />
						</IconButton>
					)}
				</Flex>
			</Flex>

			{isEditModalOpen && (
				<EditConfigurationPropertyModal
					open={isEditModalOpen}
					handleClose={() => setIsEditModalOpen(false)}
					config={config}
					tenantId={tenantId}
				/>
			)}
			{isUneditableModalOpen && (
				<UneditableConfigurationModal
					open={isUneditableModalOpen}
					handleClose={() => setIsUneditableModalOpen(false)}
					reason={getUneditableReason(isPublicTenant)}
				/>
			)}
		</>
	);
}
