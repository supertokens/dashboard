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
import { ReactComponent as PencilIcon } from "../../../../assets/edit-unfilled.svg";
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import { ReactComponent as QuestionMarkIcon } from "../../../../assets/question-mark.svg";
import { PUBLIC_TENANT_ID } from "../../../../constants";
import { getConnectionUri } from "../../../../utils";
import TooltipContainer from "../../tooltip/tooltip";
import { useTenantDetailContext } from "./TenantDetailContext";
import { EditCoreConfigPropertyDialog } from "./editCoreConfigPropertyDialog/EditCoreConfigPropertyDialog";
import { EditPluginPropertyDialog } from "./editPluginPropertyDialog/EditPluginPropertyDialog";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "./tenantDetailPanel/TenantDetailPanel";
import { UneditablePropertyDialog } from "./uneditablePropertyDialog/UneditablePropertyDialog";

export const CoreConfigSection = () => {
	const { tenantInfo } = useTenantDetailContext();
	const [showPluginDialog, setShowPluginDialog] = useState(false);

	const hasPluginProperties = tenantInfo.coreConfig.some((config) => config.isPluginProperty);

	let databaseType: "postgres" | "mysql" | null = null;

	if (hasPluginProperties) {
		if (tenantInfo.coreConfig.some((property) => property.key.startsWith("postgresql_"))) {
			databaseType = "postgres";
		} else if (tenantInfo.coreConfig.some((property) => property.key.startsWith("mysql_"))) {
			databaseType = "mysql";
		}
	}

	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip tooltip="Customize the supertokens core settings that you want to use for your tenant.">
					Core Config
				</PanelHeaderTitleWithTooltip>
			</PanelHeader>

			<div className="tenant-detail__core-config-table">
				<div className="tenant-detail__core-config-table__header">
					<div className="tenant-detail__core-config-table__header__item">Property name</div>
					<div className="tenant-detail__core-config-table__header__item">Value</div>
				</div>
				<div className="tenant-detail__core-config-table__body">
					{tenantInfo.coreConfig
						.filter((config) => !config.isPluginProperty)
						.map((config) => {
							return (
								<CoreConfigTableRow
									name={config.key}
									value={config.value}
									type={config.valueType}
									isNullable={config.isNullable}
									key={config.key}
									tooltip={config.description}
									defaultValue={config.defaultValue}
									isDifferentAcrossTenants={config.isDifferentAcrossTenants}
									isPluginProperty={config.isPluginProperty}
									isPluginPropertyEditable={config.isPluginPropertyEditable}
									possibleValues={config.possibleValues}
								/>
							);
						})}
				</div>
			</div>
			{hasPluginProperties && (
				<>
					<div className="tenant-detail__core-config-table__plugin-properties-container">
						<h2 className="tenant-detail__core-config-table__plugin-propertier-header">
							Database Properties
						</h2>
						<hr className="tenant-detail__core-config-table__plugin-properties-divider" />
						<p className="tenant-detail__core-config-table__plugin-properties-description">
							Some of these properties need to be modified together, hence they cannot be directly
							modified from the UI, instead you can make an API request to core to modify these
							properties.{" "}
							<button
								onClick={() => setShowPluginDialog(true)}
								className="tenant-detail__core-config-table__button-link">
								Click here
							</button>{" "}
							to see an example.
						</p>
					</div>
					<div className="tenant-detail__core-config-table">
						<div className="tenant-detail__core-config-table__header">
							<div className="tenant-detail__core-config-table__header__item">Property name</div>
							<div className="tenant-detail__core-config-table__header__item">Value</div>
						</div>
						<div className="tenant-detail__core-config-table__body">
							{tenantInfo.coreConfig
								.filter((config) => config.isPluginProperty)
								.map((config) => {
									return (
										<CoreConfigTableRow
											name={config.key}
											value={config.value}
											type={config.valueType}
											isNullable={config.isNullable}
											key={config.key}
											tooltip={config.description}
											defaultValue={config.defaultValue}
											isDifferentAcrossTenants={config.isDifferentAcrossTenants}
											isPluginProperty={config.isPluginProperty}
											isPluginPropertyEditable={config.isPluginPropertyEditable}
											possibleValues={config.possibleValues}
										/>
									);
								})}
						</div>

						{showPluginDialog && databaseType !== null && (
							<EditPluginPropertyDialog
								onCloseDialog={() => setShowPluginDialog(false)}
								tenantId={tenantInfo.tenantId}
								databaseType={databaseType}
							/>
						)}
					</div>
				</>
			)}
		</PanelRoot>
	);
};

type CoreConfigTableRowProps = {
	name: string;
	value: string | number | boolean | null;
	type: "string" | "boolean" | "number";
	isNullable: boolean;
	tooltip: string;
	defaultValue: string | number | boolean | null;
	possibleValues?: string[];
	isDifferentAcrossTenants: boolean;
	isPluginProperty: boolean;
	isPluginPropertyEditable: boolean;
};

const connectionURI = getConnectionUri();
const isUsingSaaS = connectionURI.includes("aws.supertokens.io");
const isUsingPublicApp = !/appid-.*$/.test(connectionURI);

const CoreConfigTableRow = ({
	name,
	value,
	tooltip,
	type,
	isNullable,
	possibleValues,
	isDifferentAcrossTenants,
	isPluginProperty,
	isPluginPropertyEditable,
	defaultValue,
}: CoreConfigTableRowProps) => {
	const { tenantInfo } = useTenantDetailContext();
	const [isUneditablePropertyDialogVisible, setIsUneditablePropertyDialogVisible] = useState(false);
	const [isEditPropertyDialogVisible, setIsEditPropertyDialogVisible] = useState(false);
	const isPublicTenant = tenantInfo.tenantId === PUBLIC_TENANT_ID;

	const isUneditable =
		isPublicTenant || // config of public tenant are not editable
		(isPluginProperty && !isPluginPropertyEditable) || // plugin property that is marked as not editable
		(!isPublicTenant && !isDifferentAcrossTenants); // in a non-public tenant, config that's not different across tenants are not editable

	const renderUneditablePropertyReason = () => {
		if (isUsingSaaS) {
			if (isUsingPublicApp) {
				if (isPublicTenant) {
					// SaaS / public app / public tenant
					return (
						<>
							Please use the{" "}
							<a href="https://supertokens.com/dashboard-saas">SuperTokens SaaS Dashboard</a> to edit this
							property.
						</>
					);
				} else {
					// SaaS / public app / non-public tenant
					// You are not allowed to edit value of the property because it cannot be different across tenants
					// So you still need to update the app, which happens on the SuperTokens SaaS dashboard
					return (
						<>
							Please use the{" "}
							<a href="https://supertokens.com/dashboard-saas">SuperTokens SaaS Dashboard</a> to edit this
							property.
						</>
					);
				}
			} else {
				if (isPublicTenant) {
					// SaaS / non-public app / public tenant
					// Updating app is not allowed from the SDK, so use the core API directly
					return (
						<>
							Please use the Update App API to configure this property. Refer to the{" "}
							<a href="https://supertokens.com/docs/multitenancy/new-app#create-a-new--update-an-app-in-the-core">
								docs
							</a>{" "}
							for more information.
						</>
					);
				} else {
					// SaaS / non-public app / non-public tenant
					// Updating properties that are not different across tenants, will happen through app updation, so
					// use the Core API directly to do the update
					return (
						<>
							Please use the Update App API to configure this property. Refer to the{" "}
							<a href="https://supertokens.com/docs/multitenancy/new-app#create-a-new--update-an-app-in-the-core">
								docs
							</a>{" "}
							for more information.
						</>
					);
				}
			}
		} else {
			if (isUsingPublicApp) {
				if (isPublicTenant) {
					// No SaaS (self hosted) / public app / public tenant
					// We don't consider the CUD case as it's not common for self-hosted users to use CUDs. CUDs are
					// mostly used in the SuperTokens SaaS
					return "This property is configurable only via the config.yaml file or via Docker env variables.";
				} else {
					// No SaaS (self hosted) / public app / non-public tenant
					// Not different across tenants, so it should be configured via config.yaml / Docker env
					return "This property is configurable only via the config.yaml file or via Docker env variables.";
				}
			} else {
				if (isPublicTenant) {
					// No SaaS (self hosted) / non-public app / public tenant
					// Should use the update App API, which is not available in the SDK
					return (
						<>
							Please use the Update App API to configure this property. Refer to the{" "}
							<a href="https://supertokens.com/docs/multitenancy/new-app#create-a-new--update-an-app-in-the-core">
								docs
							</a>{" "}
							for more information.
						</>
					);
				} else {
					// No SaaS (self hosted) / non-public app / non-public tenant
					// Not different across tenant property should be updated on the app
					return (
						<>
							Please use the Update App API to configure this property. Refer to the{" "}
							<a href="https://supertokens.com/docs/multitenancy/new-app#create-a-new--update-an-app-in-the-core">
								docs
							</a>{" "}
							for more information.
						</>
					);
				}
			}
		}
	};

	return (
		<>
			<div className="tenant-detail__core-config-table__row">
				<div className="tenant-detail__core-config-table__row__label-container">
					{tooltip && (
						<TooltipContainer
							tooltipWidth={465}
							tooltip={
								<>
									<b>{name}</b>
									<div style={{ height: 8 }} />
									{tooltip}
								</>
							}>
							<InfoIcon />
						</TooltipContainer>
					)}
					<div className="tenant-detail__core-config-table__row__label">{name}</div>
				</div>
				<div className="tenant-detail__core-config-table__row__value">
					<div className="tenant-detail__core-config-table__row__value__text">{`${value}`}</div>
					{isUneditable ? (
						<button
							className="tenant-detail__core-config-table__row__uneditable-button-container"
							onClick={() => setIsUneditablePropertyDialogVisible(true)}>
							<QuestionMarkIcon />
						</button>
					) : (
						<button
							className="tenant-detail__core-config-table__row__edit-button-container"
							onClick={() => setIsEditPropertyDialogVisible(true)}>
							<PencilIcon />
						</button>
					)}
				</div>
			</div>
			{isEditPropertyDialogVisible && (
				<EditCoreConfigPropertyDialog
					name={name}
					value={value}
					type={type}
					isNullable={isNullable}
					possibleValues={possibleValues}
					onCloseDialog={() => setIsEditPropertyDialogVisible(false)}
					defaultValue={defaultValue}
					description={tooltip}
				/>
			)}
			{isUneditablePropertyDialogVisible && (
				<UneditablePropertyDialog onCloseDialog={() => setIsUneditablePropertyDialogVisible(false)}>
					{renderUneditablePropertyReason()}
				</UneditablePropertyDialog>
			)}
		</>
	);
};
