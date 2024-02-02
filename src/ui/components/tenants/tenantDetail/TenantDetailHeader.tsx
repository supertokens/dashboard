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

import Button from "../../button";
import { useTenantDetailContext } from "./TenantDetailContext";

const HeaderItem = ({ title, value }: { title: string; value: string }) => {
	return (
		<div className="tenant-detail__header__header_item">
			<span className="tenant-detail__header__header_item__title">{title}:</span>
			<span className="tenant-detail__header__header_item__value">{value}</span>
		</div>
	);
};

export const TenantDetailHeader = () => {
	const { tenantInfo } = useTenantDetailContext();
	return (
		<div className="tenant-detail__header panel">
			<HeaderItem
				title="Tenant Id"
				value={tenantInfo.tenantId}
			/>
			<HeaderItem
				title="No. of Users"
				value={tenantInfo.userCount?.toString()}
			/>
			<Button>See Users</Button>
		</div>
	);
};
