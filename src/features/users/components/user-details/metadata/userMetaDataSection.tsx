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

import Button from "@shared/components/button";
import DashboardError from "@shared/components/error";
import ItemLabel from "@shared/components/itemLabel";
import Loader from "@shared/components/loader";
import Separator from "@shared/components/separator";
import { Box, Flex, TextArea } from "@radix-ui/themes";
import { assertNever } from "@utils/assertNever";
import { useState } from "react";

import styles from "./userMetaDataSection.module.scss";
import { Pencil1Icon } from "@radix-ui/react-icons";

const MetaDataHeader = ({
	isEditing,
	setIsEditing,
}: {
	isEditing: boolean;
	setIsEditing: (isEditing: boolean) => void;
}) => {
	return (
		<Box width="100%">
			<Flex
				className={styles["metadata__header"]}
				justify="between"
				align="center"
				px="4"
				py="3">
				<Flex
					align="center"
					justify="between"
					width="100%">
					<ItemLabel mr="2">User metadata details </ItemLabel>
					{!isEditing ? (
						<Button
							size="2"
							onClick={() => setIsEditing(true)}>
							<Pencil1Icon /> Edit
						</Button>
					) : (
						<Flex
							align="center"
							gap="2">
							<Button
								variant="outline"
								color="gray"
								size="2"
								onClick={() => setIsEditing(false)}>
								Cancel
							</Button>
							<Button size="2">Save</Button>
						</Flex>
					)}
				</Flex>
			</Flex>
			<Separator fullWidth />
		</Box>
	);
};

const MetaDataContent = ({ isEditing }: { isEditing: boolean }) => {
	return (
		<Flex
			p="4"
			className={styles["metadata__content"]}>
			<TextArea
				className={`${styles["metadata__content__textarea"]} ${
					!isEditing ? styles["metadata__content__textarea--active"] : ""
				}`}
			/>
		</Flex>
	);
};

export default function MetaData() {
	const [state] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");
	const [isEditing, setIsEditing] = useState<boolean>(false);

	switch (state) {
		case "LOADING":
			return (
				<Flex
					width="100%"
					p="3">
					<Loader type="list" />
				</Flex>
			);
		case "SUCCESS":
			return (
				<Flex
					width="100%"
					direction="column">
					<MetaDataHeader
						isEditing={isEditing}
						setIsEditing={setIsEditing}
					/>
					<MetaDataContent isEditing={isEditing} />
				</Flex>
			);
		case "ERROR":
			return <DashboardError withBackground={false} />;
		default:
			assertNever(state);
	}
}
