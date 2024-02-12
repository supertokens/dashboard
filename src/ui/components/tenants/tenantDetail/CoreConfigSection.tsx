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
import { useEffect, useState } from "react";
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import { ReactComponent as PlusIcon } from "../../../../assets/plus.svg";
import { ReactComponent as RightArrow } from "../../../../assets/right_arrow_icon.svg";
import { ReactComponent as TrashIcon } from "../../../../assets/trash.svg";
import { CORE_CONFIG_PROPERTIES } from "../../../../constants";
import Button from "../../button";
import InputField from "../../inputField/InputField";
import { Toggle } from "../../toggle/Toggle";
import TooltipContainer from "../../tooltip/tooltip";
import { useTenantDetailContext } from "./TenantDetailContext";
import { AddNewConfigPropertyDialog } from "./addNewConfigProperty/AddNewConfigProperty";
import {
	PanelHeader,
	PanelHeaderAction,
	PanelHeaderTitleWithTooltip,
	PanelRoot,
} from "./tenantDetailPanel/TenantDetailPanel";

export const CoreConfigSection = () => {
	const [isEditing, setIsEditing] = useState(false);
	const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
	const { tenantInfo } = useTenantDetailContext();
	const [currentConfig, setCurrentConfig] = useState(tenantInfo?.coreConfig ?? {});
	const hasProperties = Object.keys(tenantInfo?.coreConfig ?? {}).length > 0;

	// Ensure that the state reflects the latest core config
	useEffect(() => {
		setCurrentConfig(tenantInfo.coreConfig);
	}, [tenantInfo.coreConfig]);

	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip tooltip="Customize the supertokens core settings that you want to use for your tenant.">
					Core Config
				</PanelHeaderTitleWithTooltip>
				{hasProperties && (
					<PanelHeaderAction
						setIsEditing={setIsEditing}
						isEditing={isEditing}
					/>
				)}
			</PanelHeader>
			{!hasProperties ? (
				<div className="block-info block-medium text-small tenant-detail__no-config-info-block">
					<div className="tenant-detail__no-config-info-block__no-property-pill">No Property Added</div>
					<p>
						There are no core config properties added by you for this tenant. You can click below to add new
						property or{" "}
						<a
							target="_blank"
							rel="noreferrer noopener"
							href="https://github.com/supertokens/supertokens-core/blob/master/config.yaml">
							click here
						</a>{" "}
						to see the list of all available core config property options.
					</p>
				</div>
			) : (
				<div className="tenant-detail__core-config-table">
					<div className="tenant-detail__core-config-table__header">
						<div className="tenant-detail__core-config-table__header__item">Property name</div>
						<div className="tenant-detail__core-config-table__header__item">Value</div>
					</div>
					<div className="tenant-detail__core-config-table__body">
						{Object.entries(currentConfig).map(([name, value]) => {
							const propertyObj = CORE_CONFIG_PROPERTIES.find((property) => property.name === name);
							if (propertyObj === undefined) {
								return null;
							}
							return (
								<CoreConfigTableRow
									key={name}
									name={name}
									value={value as string | number | boolean}
									type={propertyObj.type as "string" | "number" | "boolean" | "enum"}
									handleChange={(name: string, newValue: string | number | boolean) => {
										setCurrentConfig((prev) => ({ ...prev, [name]: newValue }));
									}}
									isEditing={isEditing}
									tooltip={propertyObj.description}
								/>
							);
						})}
					</div>
				</div>
			)}
			<div className="tenant-detail__core-config-footer">
				<Button
					id="create-tenant"
					onClick={() => setIsAddPropertyModalOpen(true)}>
					<PlusIcon />
					Add Property
				</Button>

				{hasProperties && (
					<a
						className="tenant-detail__core-config-footer__footer-link"
						target="_blank"
						rel="noreferrer noopener"
						href="https://github.com/supertokens/supertokens-core/blob/master/config.yaml">
						See all config properties <RightArrow />
					</a>
				)}
			</div>
			{isAddPropertyModalOpen && (
				<AddNewConfigPropertyDialog onCloseDialog={() => setIsAddPropertyModalOpen(false)} />
			)}
		</PanelRoot>
	);
};

type CoreConfigTableRow<T extends string | number | boolean> = {
	name: string;
	value: T;
	type: "string" | "boolean" | "number" | "enum";
	handleChange: (name: string, newValue: string | number | boolean) => void;
	isEditing: boolean;
	tooltip?: string;
};

type CoreConfigTableRowProps = CoreConfigTableRow<string> | CoreConfigTableRow<number> | CoreConfigTableRow<boolean>;

const CoreConfigTableRow = ({ name, value, tooltip, type, isEditing, handleChange }: CoreConfigTableRowProps) => {
	return (
		<div className="tenant-detail__core-config-table__row">
			<div className="tenant-detail__core-config-table__row__label">
				{name}
				{tooltip && (
					<TooltipContainer tooltip={tooltip}>
						<InfoIcon />
					</TooltipContainer>
				)}
			</div>
			<div className="tenant-detail__core-config-table__row__value">
				{(type === "string" || type === "number") &&
					(isEditing ? (
						<InputField
							type="text"
							name={name}
							handleChange={(e) => {
								if (type === "number" && typeof value === "number") {
									handleChange(name, e.target.valueAsNumber);
								} else if (type === "string" && typeof value === "string") {
									handleChange(name, e.target.value);
								}
							}}
							value={`${value}`}
						/>
					) : (
						<div className="tenant-detail__core-config-table__row__value__text">{value}</div>
					))}
				{typeof value === "boolean" && type === "boolean" && (
					<Toggle
						name={name}
						id={name}
						checked={value}
						disabled={!isEditing}
						onChange={() => handleChange(name, !value)}
					/>
				)}

				{isEditing && (
					<button
						onClick={() => null}
						aria-label="Delete Property"
						className="tenant-detail__core-config-table__row__delete-property">
						<TrashIcon />
					</button>
				)}
			</div>
		</div>
	);
};
