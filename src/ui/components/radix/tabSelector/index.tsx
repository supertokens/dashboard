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
import Button from "../button";

import "./index.scss";
export default function TabSelector({
	tabs,
	onTabChange,
	selectedTab,
	children,
}: {
	tabs: {
		name: string;
		value: string;
	}[];
	onTabChange: (tab: string) => void;
	selectedTab: string;
	children: React.ReactNode;
}) {
	return (
		<Flex
			direction="column"
			className="tab-selector">
			<Flex
				gap="8"
				align="center"
				className="tab-selector__header">
				{tabs.map((tab) => {
					return (
						<Button
							key={tab.value}
							onClick={() => onTabChange(tab.value)}
							className={`tab-selector__tab ${
								selectedTab === tab.value ? "tab-selector__tab--selected" : ""
							}`}>
							<Text
								className={`tab-selector__tab-text ${
									selectedTab === tab.value ? "tab-selector__tab-text--selected" : ""
								}`}>
								{tab.name}
							</Text>
						</Button>
					);
				})}
			</Flex>
			{/* Table body */}
			<Flex className="tab-selector__content">{children}</Flex>
		</Flex>
	);
}
