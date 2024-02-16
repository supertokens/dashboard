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

// These components are used to compose the tenant detail panel
// <PanelRoot>
//     <PanelHeader>
//         <PanelHeaderTitle tooltip="Test">
//             Tenant Detail
//         </PanelHeaderTitle>
//         <PanelHeaderAction setIsEditing={() => {}} isEditing={false} />
//     </PanelHeader>
//     {children}
// </PanelRoot>

import { getImageUrl } from "../../../../../utils";
import Button from "../../../button";
import IconButton from "../../../common/iconButton";
import TooltipContainer from "../../../tooltip/tooltip";
import "./tenantDetailPanel.scss";

export const PanelRoot = ({ children }: { children: React.ReactNode }) => {
	return <div className="panel-root panel">{children}</div>;
};

export const PanelHeader = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<div className="panel-root__header">{children}</div>
			<div className="panel-root__divider"></div>
		</>
	);
};

export const PanelHeaderTitleWithTooltip = ({
	children,
	tooltip,
}: {
	children: React.ReactNode;
	tooltip?: React.ReactNode;
}) => {
	return (
		<div className="panel-root__header__title-container">
			<h1>{children}</h1>
			{tooltip && (
				<TooltipContainer tooltip={tooltip}>
					<span className="panel-root__header__title-container__tooltip">
						<img
							src={getImageUrl("help-icon.png")}
							alt="help"
						/>
					</span>
				</TooltipContainer>
			)}
		</div>
	);
};

export const PanelHeaderAction = ({
	setIsEditing,
	handleSave,
	isEditing,
	isSaving,
}: {
	setIsEditing: (isEditing: boolean) => void;
	handleSave: () => void;
	isEditing: boolean;
	isSaving?: boolean;
}) => {
	return !isEditing ? (
		<IconButton
			size="small"
			text="Edit"
			tint="var(--color-link)"
			icon={getImageUrl("edit.svg")}
			onClick={() => {
				setIsEditing(true);
			}}
		/>
	) : (
		<div className="panel-root__header__actions">
			<Button
				size="sm"
				color="gray-outline"
				disabled={isSaving}
				onClick={() => setIsEditing(false)}>
				Cancel
			</Button>
			<Button
				size="sm"
				color="secondary"
				isLoading={isSaving}
				disabled={isSaving}
				onClick={handleSave}>
				Save
			</Button>
		</div>
	);
};
