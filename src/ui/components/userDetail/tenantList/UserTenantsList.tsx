/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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
import { LayoutPanel } from "../../layout/layoutPanel";
import "./UserTenantsList.scss";

type Props = {
	tenantIds: string[];
};

const Header = () => {
	return <div className="title">Tenant IDs</div>;
};

export const UserTenantsList = (props: Props) => {
	return (
		<LayoutPanel header={<Header />}>
			<div className="tenant-list-container">
				{props.tenantIds.map((tenantId) => {
					return (
						<div
							key={tenantId}
							className="tenant-pill">
							{tenantId}
						</div>
					);
				})}

				{props.tenantIds.length === 0 && <div>No associated tenants</div>}
			</div>
		</LayoutPanel>
	);
};
