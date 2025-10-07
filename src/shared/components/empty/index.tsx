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

import { Flex, Text } from "@radix-ui/themes";
import { getImageUrl } from "@shared/utils";

import "./index.scss";
import { ReactNode } from "react";

export default function EmptyList({
	iconUrl,
	title,
	description,
}: {
	iconUrl: string;
	title: ReactNode;
	description: ReactNode;
}) {
	return (
		<Flex className="empty-list">
			<Flex
				direction="column"
				justify="center"
				align="center"
				className="empty-list__content">
				<img
					src={getImageUrl(iconUrl)}
					alt="empty"
					className="empty-list__icon"
				/>
				<Text
					className="empty-list__title"
					size="3"
					weight="medium"
					mt="2"
					mb="4">
					{title}
				</Text>
				<Text
					className="empty-list__description"
					size="2"
					weight="medium">
					{description}
				</Text>
			</Flex>
		</Flex>
	);
}
