/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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
import { Flex } from "@radix-ui/themes";

import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";

import { useRoles } from "@features/users/hooks/useRoles";
import RolesHeader from "./RolesHeader";
import RolesList from "./RolesList";

interface RolesProps {
	readonly userId: string;
}

export default function Roles({ userId }: RolesProps) {
	const [selectedTenantId, setSelectedTenantId] = useState<string>("public");
	const { isLoading, error } = useRoles(userId, selectedTenantId);

	const handleTenantChange = (tenantId: string) => {
		setSelectedTenantId(tenantId);
	};

	if (isLoading) {
		return (
			<Flex
				width="100%"
				p="3">
				<Loader type="list" />
			</Flex>
		);
	}

	if (error) {
		return <DashboardError withBackground={false} />;
	}

	return (
		<Flex
			width="100%"
			direction="column">
			<RolesHeader
				userId={userId}
				selectedTenantId={selectedTenantId}
				onTenantChange={handleTenantChange}
			/>
			<RolesList
				userId={userId}
				selectedTenantId={selectedTenantId}
			/>
		</Flex>
	);
}
