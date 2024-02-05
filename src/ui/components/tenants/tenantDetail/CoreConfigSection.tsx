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
import {
	PanelHeader,
	PanelHeaderAction,
	PanelHeaderTitleWithTooltip,
	PanelRoot,
} from "./tenantDetailPanel/TenantDetailPanel";

export const CoreConfigSection = () => {
	const [isEditing, setIsEditing] = useState(false);
	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip tooltip="Customize the supertokens core settings that you want to use for your tenant.">
					Core Config
				</PanelHeaderTitleWithTooltip>
				<PanelHeaderAction
					setIsEditing={setIsEditing}
					isEditing={isEditing}
				/>
			</PanelHeader>
		</PanelRoot>
	);
};
