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

import { Flex, Text } from "@radix-ui/themes";
import { ChevronRightIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import Button from "../button";
import "./index.scss";

export default function ItemDetailHeader({
	handleBackToItemList,
	backToTitle,
	breadcrumbParent,
	breadcrumbChild,
}: {
	handleBackToItemList: () => void;
	backToTitle: string;
	breadcrumbParent: string;
	breadcrumbChild: string;
}) {
	return (
		<Flex
			align="center"
			justify="between"
			className="item-detail-header">
			<Flex
				align="center"
				gap="2"
				className="item-detail-header__breadcrumb">
				<Text
					className="item-detail-header__breadcrumb-parent"
					onClick={handleBackToItemList}>
					{breadcrumbParent}
				</Text>
				<ChevronRightIcon />
				<Text className="item-detail-header__breadcrumb-child">{breadcrumbChild}</Text>
			</Flex>
			<Button
				onClick={handleBackToItemList}
				variant="outline"
				color="gray"
				className="item-detail-header__back-button">
				<ArrowLeftIcon />
				<Text className="item-detail-header__back-button-text">{backToTitle}</Text>
			</Button>
		</Flex>
	);
}
