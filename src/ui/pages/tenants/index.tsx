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

import { useContext, useEffect, useState } from "react";
import { useGetTenantsList, type Tenant } from "../../../api/tenants/list";
import { getImageUrl } from "../../../utils";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import "./index.scss";

export default function TenantManagement() {
	const { fetchTenants } = useGetTenantsList();
	const { showToast } = useContext(PopupContentContext);
	const [tenants, setTenants] = useState<Array<Tenant> | undefined>(undefined);

	useEffect(() => {
		const getTenants = async () => {
			try {
				const response = await fetchTenants();
				if (response?.status === "OK") {
					setTenants(response.tenants);
				} else {
					throw new Error("Failed to fetch tenants");
				}
			} catch (err) {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Something went wrong Please try again!</>,
				});
			}
		};
		void getTenants();
	}, []);

	return (
		<div className="tenants-container">
			<h1 className="tenants-title">Tenant Management</h1>
			<p className="text-small tenants-subtitle">
				One place to manage all your tenants. Create or edit tenants and their login methods according to your
				needs.
			</p>
			{/* {renderContent()} */}
		</div>
	);
}
