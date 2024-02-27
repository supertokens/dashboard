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
import { ReactComponent as ChevronDown } from "../../../../../assets/chevron-down.svg";
import { ReactComponent as CloseIconActive } from "../../../../../assets/close-active.svg";
import { ReactComponent as CloseIconDefault } from "../../../../../assets/close-inactive.svg";
import { CollapsibleContent, CollapsibleFixed, CollapsibleRoot } from "../../../collapsible/Collapsible";
import { ThirdPartyProviderInput } from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import "./thirdPartyProviderConfig.scss";

export const ClientConfig = () => {
	const [scopes, setScopes] = useState<string[]>([""]);
	return (
		<div className="client-config-container">
			<div className="client-config-container__header"></div>
			<div className="client-config-container__fields-container">
				<div className="client-config-container__fields">
					<ThirdPartyProviderInput
						label="Client Id"
						isRequired
						tooltip="The client ID of the third-party provider."
						type="text"
						name="clientId"
						handleChange={() => null}
					/>
					<ThirdPartyProviderInput
						label="Client Secret"
						isRequired
						tooltip="The client ID of the third-party provider."
						type="text"
						name="clientSecret"
						handleChange={() => null}
					/>
				</div>
				<hr className="client-config-container__divider" />
				<CollapsibleRoot>
					<CollapsibleFixed>
						{({ isCollapsed, setIsCollapsed }) => (
							<div className="client-config-container__advanced-settings-header">
								<h2 className="client-config-container__advanced-settings-title">Advanced Settings</h2>
								<button
									aria-label="Toggle Settings"
									className={`client-config-container__advanced-settings-toggle ${
										!isCollapsed ? "client-config-container__advanced-settings-toggle--open" : ""
									}`}
									onClick={() => setIsCollapsed(!isCollapsed)}>
									<ChevronDown />
								</button>
							</div>
						)}
					</CollapsibleFixed>

					<CollapsibleContent>
						<div className="client-config-container__advanced-settings">
							<Scopes
								scopes={scopes}
								setScopes={setScopes}
							/>
						</div>
					</CollapsibleContent>
				</CollapsibleRoot>
			</div>
		</div>
	);
};

const Scopes = ({ scopes, setScopes }: { scopes: string[]; setScopes: (scopes: string[]) => void }) => {
	return (
		<div className="scopes-container">
			<div className="scopes-container__input-container">
				<ThirdPartyProviderInput
					label="Scopes"
					tooltip="The scopes required by the third-party provider."
					type="text"
					name="scopes"
					value={scopes[0] ?? ""}
					handleChange={(e) => {
						const newScopes = [...scopes];
						newScopes[0] = e.target.value;
						setScopes(newScopes);
					}}
					minLabelWidth={108}
				/>
				{scopes.length > 1 && (scopes[0] !== "" || scopes[0] !== undefined) && (
					<DeleteScopeButton
						onClick={() => setScopes(scopes.slice(0, -1))}
						label="Delete Scope"
					/>
				)}
			</div>
			{scopes?.slice(1).map((scope, index) => (
				<div
					className="scopes-container__input-container"
					key={index}>
					<ThirdPartyProviderInput
						label=""
						name={`scope-${index}`}
						type="text"
						value={scope}
						handleChange={(e) => {
							const newScopes = [...scopes];
							newScopes[index + 1] = e.target.value;
							setScopes(newScopes);
						}}
						minLabelWidth={108}
					/>
					<DeleteScopeButton
						onClick={() => setScopes(scopes.filter((_, i) => i !== index + 1))}
						label="Delete Scope"
					/>
				</div>
			))}
			<div className="scopes-container__footer">
				<hr className="scopes-container__divider" />
				<button
					className="scopes-container__add-new"
					onClick={() => setScopes([...scopes, ""])}>
					+ Add new
				</button>
			</div>
		</div>
	);
};

const DeleteScopeButton = ({ onClick, label }: { onClick: () => void; label: string }) => {
	const [isHovered, setIsHovered] = useState(false);
	return (
		<button
			className="delete-scope-button"
			onClick={onClick}
			aria-label={label}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}>
			{isHovered ? <CloseIconActive /> : <CloseIconDefault />}
		</button>
	);
};
