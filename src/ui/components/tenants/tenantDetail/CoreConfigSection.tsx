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
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import InputField from "../../inputField/InputField";
import { Toggle } from "../../toggle/Toggle";
import TooltipContainer from "../../tooltip/tooltip";
import {
	PanelHeader,
	PanelHeaderAction,
	PanelHeaderTitleWithTooltip,
	PanelRoot,
} from "./tenantDetailPanel/TenantDetailPanel";

export const CoreConfigSection = () => {
	const [isEditing, setIsEditing] = useState(false);
	const hasProperties = true;
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
						<CoreConfigTableRow
							label="cookieDomain"
							value={true}
							type="boolean"
							tooltip="The domain to set the cookie to. This is useful when you want to share the cookie across subdomains."
						/>
					</div>
				</div>
			)}
		</PanelRoot>
	);
};

type CoreConfigTableRow<T> = {
	label: string;
	value: T;
	type: T extends string ? "string" : T extends number ? "number" : "boolean";
	tooltip?: string;
};

type CoreConfigTableRowProps = CoreConfigTableRow<string> | CoreConfigTableRow<number> | CoreConfigTableRow<boolean>;

const CoreConfigTableRow = ({ label, value, type, tooltip }: CoreConfigTableRowProps) => {
	const [isActive, setActive] = useState(false);
	return (
		<div className="tenant-detail__core-config-table__row">
			<div className="tenant-detail__core-config-table__row__label">
				{label}
				{tooltip && (
					<TooltipContainer tooltip={tooltip}>
						<InfoIcon />
					</TooltipContainer>
				)}
			</div>
			<div className="tenant-detail__core-config-table__row__value">
				{type === "string" && (
					<InputField
						type="text"
						name={label}
						handleChange={() => null}
						disabled
						value={value}
					/>
				)}
				{type === "boolean" && (
					<Toggle
						name={label}
						id={label}
						checked={isActive}
						onChange={() => setActive(!isActive)}
					/>
				)}
			</div>
		</div>
	);
};
