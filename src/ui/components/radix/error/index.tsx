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

import { Box, Flex, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import Button from "../button";
import "./error.scss";

export default function DashboardError() {
	return (
		<Box
			className="dashboard-error"
			p="4">
			<Flex
				direction="column"
				align="center"
				justify="center"
				className="dashboard-error__content"
				minHeight="300px">
				<ExclamationTriangleIcon
					width="20"
					height="20"
					className="dashboard-error__content__icon"
				/>
				<Text
					size="3"
					mt="4"
					mb="2"
					className="dashboard-error__content__title">
					Something went wrong
				</Text>
				<Text
					size="2"
					weight="medium"
					className="dashboard-error__content__description">
					An error occurred while loading this content.
				</Text>
				<Button
					size="2"
					mt="4"
					onClick={() => window.location.reload()}>
					<ReloadIcon /> Try again
				</Button>
			</Flex>
		</Box>
	);
}
