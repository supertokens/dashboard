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
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import { Toggle } from "../../toggle/Toggle";
import TooltipContainer from "../../tooltip/tooltip";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "./tenantDetailPanel/TenantDetailPanel";

// TODO: Will probably come from the API
const BUILT_IN_LOGIN_METHODS = [
	{
		label: "Email Password",
		description: "Sign in/up using email and password",
		id: "emailpassword",
	},
	{
		label: "OTP - Email",
		description: "Sign in/up using OTP sent to email",
		id: "otp-email",
	},
	{
		label: "OTP - Phone",
		description: "Sign in/up using OTP sent to phone",
		id: "otp-phone",
	},
	{
		label: "Third Party",
		description: "Sign in/up using third party providers",
		id: "thirdparty",
	},
	{
		label: "Link - Email",
		description: "Sign in/up using link sent to email",
		id: "link-email",
	},
	{
		label: "Link - Phone",
		description: "Sign in/up using link sent to phone",
		id: "link-phone",
	},
];

export const LoginMethodsSection = () => {
	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip tooltip="The login methods you want to enable for the tenant">
					Enabled Login Methods
				</PanelHeaderTitleWithTooltip>
			</PanelHeader>
			<div className="tenant-detail__factors-container">
				<h2 className="tenant-detail__factors-container__header">Built-in Login methods</h2>
				<div className="tenant-detail__factors-container__grid">
					{BUILT_IN_LOGIN_METHODS.map((method) => (
						<LoginFactor
							key={method.id}
							label={method.label}
							description={method.description}
							checked={true}
							onChange={() => undefined}
						/>
					))}
				</div>
			</div>
		</PanelRoot>
	);
};

export const SecondaryFactors = () => {
	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip tooltip="The secondary factors that would be required after logging in for successful authentation for this tenant">
					Secondary Factors
				</PanelHeaderTitleWithTooltip>
			</PanelHeader>
			<div className="tenant-detail__factors-container">
				<h2 className="tenant-detail__factors-container__header">Built-in Login methods</h2>
				<div className="tenant-detail__factors-container__grid">
					{BUILT_IN_LOGIN_METHODS.map((method) => (
						<LoginFactor
							key={method.id}
							label={method.label}
							description={method.description}
							checked={true}
							onChange={() => undefined}
						/>
					))}
				</div>
			</div>
		</PanelRoot>
	);
};

const LoginFactor = ({
	label,
	description,
	checked,
	onChange,
}: {
	label: string;
	description: string;
	checked: boolean;
	onChange: () => void;
}) => {
	return (
		<div className="tenant-detail__factors-container__grid__factor">
			<div className="tenant-detail__factors-container__grid__factor__label-container">
				<TooltipContainer
					tooltipWidth={200}
					position="bottom"
					tooltip={description}>
					<InfoIcon />
				</TooltipContainer>
				<div className="tenant-detail__factors-container__grid__factor__label-container__label">{label}</div>
			</div>
			<Toggle
				checked={checked}
				onChange={onChange}
				id={label}
			/>
		</div>
	);
};
