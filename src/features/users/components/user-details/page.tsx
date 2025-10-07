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

import { Flex } from "@radix-ui/themes";

import { useNavigationHelpers } from "@shared/navigation";
import { useUser } from "@features/users/hooks/useUser";
import { assertNever } from "@shared/utils/assertNever";

import PageContainer from "@shared/components/pageContainer";
import ItemDetailHeader from "@shared/components/itemDetailsHeading";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import Paper from "@shared/components/paper";
import EmptyList from "@shared/components/empty";

import { UserDetailContent } from "./UserDetails";

interface UserDetailsProps {
	readonly userId: string;
}

export default function UserDetailsPage({ userId }: UserDetailsProps) {
	const { goToUsersList } = useNavigationHelpers();

	const { userDetails, isLoading, error } = useUser(userId);

	const handleBackToItemList = () => {
		goToUsersList();
	};

	return (
		<PageContainer>
			<Flex
				gap="4"
				direction="column">
				<ItemDetailHeader
					handleBackToItemList={handleBackToItemList}
					backToTitle="Back to User Management"
					breadcrumbParent="User Management"
					breadcrumbChild="User Details"
				/>

				{(() => {
					if (isLoading) {
						return <Loader type="table-with-list" />;
					}

					if (error) {
						return <DashboardError />;
					}

					if (!userDetails) {
						return null;
					}

					switch (userDetails.status) {
						case "OK":
							return (
								<>
									<UserDetailContent user={userDetails.user} />
								</>
							);
						case "NO_USER_FOUND_ERROR":
							return (
								<Paper withBackground>
									<EmptyList
										iconUrl="user.svg"
										title="User not found"
										description="We couldn't locate this user in our system. They may have been deleted or you might not have permission to view their details."
									/>
								</Paper>
							);
						case "RECIPE_NOT_INITIALISED":
							return (
								<EmptyList
									iconUrl="user.svg"
									title="Recipe not initialised"
									description="The required authentication recipes have not been initialized in your SuperTokens configuration. Please refer to our documentation for instructions on enabling and configuring recipes."
								/>
							);
						default:
							return assertNever(userDetails);
					}
				})()}
			</Flex>
		</PageContainer>
	);
}
