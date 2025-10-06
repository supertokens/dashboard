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
import { Badge, Flex, IconButton, Text } from "@radix-ui/themes";
import { InfoCircledIcon, Pencil1Icon, QuestionMarkIcon } from "@radix-ui/react-icons";

import type { CoreConfigFieldInfo } from "@api/tenants/types";
import { assertNever } from "@utils/assertNever";
import ItemLabel from "@shared/components/itemLabel";
import TabSelector from "@shared/components/tabSelector";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import Paper from "@shared/components/paper";

import UneditableConfigurationModal from "@features/tenants/modals/UneditableConfigurationModal";
import EditConfigurationPropertyModal from "@features/tenants/modals/EditConfigurationPropertyModal";

import "./coreConfiguration.scss";

const CoreConfigurationTable = ({ tenantId, coreConfig }: { tenantId: string; coreConfig: CoreConfigFieldInfo[] }) => {
	const [isUneditableConfigurationModalOpen, setIsUneditableConfigurationModalOpen] = useState(false);
	const [isEditConfigurationPropertyModalOpen, setIsEditConfigurationPropertyModalOpen] = useState(false);
	const [selectedConfig, setSelectedConfig] = useState<CoreConfigFieldInfo | undefined>(undefined);

	return (
		<Paper
			withBackground
			withBorder
			className="core-configuration-table"
			m="4"
			p="0">
			<Flex
				p="3"
				align="center"
				className="core-configuration-table__header">
				<Text
					weight="medium"
					size="2"
					className="core-configuration-table__header__property-name">
					Property Name
				</Text>
				<Text
					weight="medium"
					size="2"
					className="core-configuration-table__header__value">
					Value
				</Text>
				<Text />
			</Flex>
			<Flex
				className="core-configuration-table__body"
				direction="column">
				{coreConfig.map((config) => {
					const isEditable = config.isDifferentAcrossTenants;
					const displayValue =
						config.value !== null
							? String(config.value)
							: config.defaultValue !== null
							? String(config.defaultValue)
							: "N/A";

					return (
						<Flex
							width="100%"
							key={config.key}
							className="core-configuration-table__body__item"
							p="3">
							<Flex
								align="center"
								className="core-configuration-table__body__item__property-name"
								gap="1">
								<InfoCircledIcon />
								<Text
									weight="regular"
									size="2">
									{config.key}
								</Text>
							</Flex>
							<Flex
								align="center"
								className="core-configuration-table__body__item__value"
								justify="between">
								<Badge className="core-configuration-table__body__item__value__badge">
									<Text
										weight="medium"
										size="2">
										{displayValue}
									</Text>
								</Badge>
								{!isEditable ? (
									<IconButton
										size="2"
										variant="soft"
										onClick={() => {
											setSelectedConfig(config);
											setIsUneditableConfigurationModalOpen(true);
										}}>
										<QuestionMarkIcon />
									</IconButton>
								) : (
									<IconButton
										size="2"
										variant="soft"
										color="gray"
										onClick={() => {
											setSelectedConfig(config);
											setIsEditConfigurationPropertyModalOpen(true);
										}}>
										<Pencil1Icon />
									</IconButton>
								)}
							</Flex>
						</Flex>
					);
				})}
			</Flex>

			<UneditableConfigurationModal
				open={isUneditableConfigurationModalOpen}
				handleClose={() => setIsUneditableConfigurationModalOpen(false)}
			/>
			<EditConfigurationPropertyModal
				open={isEditConfigurationPropertyModalOpen}
				handleClose={() => setIsEditConfigurationPropertyModalOpen(false)}
			/>
		</Paper>
	);
};

export default function CoreConfiguration({
	tenantId,
	coreConfig,
}: {
	tenantId: string;
	coreConfig: CoreConfigFieldInfo[];
}) {
	const [state] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");

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
					<CoreConfigurationTable
						tenantId={tenantId}
						coreConfig={coreConfig}
					/>
				</Flex>
			);
		case "ERROR":
			return <DashboardError />;
		default:
			return assertNever(state);
	}
}
