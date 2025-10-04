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

import { useState, useEffect } from "react";
import { Box, Flex, TextArea } from "@radix-ui/themes";
import { Pencil1Icon } from "@radix-ui/react-icons";

import Button from "@shared/components/button";
import DashboardError from "@shared/components/error";
import ItemLabel from "@shared/components/itemLabel";
import Loader from "@shared/components/loader";
import Separator from "@shared/components/separator";
import { useToast } from "@shared/components/toast";

import { useMetadata } from "@features/users/hooks/useMetadata";

import styles from "./MetaData.module.scss";

interface MetaDataHeaderProps {
	readonly isEditing: boolean;
	readonly setIsEditing: (isEditing: boolean) => void;
	readonly onSave: () => void;
	readonly isLoading: boolean;
}

const MetaDataHeader = ({ isEditing, setIsEditing, onSave, isLoading }: MetaDataHeaderProps) => {
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
								onClick={() => setIsEditing(false)}
								disabled={isLoading}>
								Cancel
							</Button>
							<Button
								size="2"
								onClick={onSave}
								loading={isLoading}>
								Save
							</Button>
						</Flex>
					)}
				</Flex>
			</Flex>
			<Separator fullWidth />
		</Box>
	);
};

interface MetaDataContentProps {
	readonly isEditing: boolean;
	readonly value: string;
	readonly onChange: (value: string) => void;
}

const MetaDataContent = ({ isEditing, value, onChange }: MetaDataContentProps) => {
	return (
		<Flex
			p="4"
			className={styles["metadata__content"]}>
			<TextArea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				readOnly={!isEditing}
				className={`${styles["metadata__content__textarea"]} ${
					!isEditing ? styles["metadata__content__textarea--active"] : ""
				}`}
				rows={15}
				placeholder="Enter user metadata as JSON..."
			/>
		</Flex>
	);
};

interface MetaDataProps {
	readonly userId: string;
}

export default function MetaData({ userId }: MetaDataProps) {
	const { metadata, updateMetadata, isUpdatingMetadata, isLoading, error } = useMetadata(userId);
	const { showSuccessToast, showErrorToast } = useToast();

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [editedMetadata, setEditedMetadata] = useState<string>("");

	// Initialize edited metadata when metadata loads
	useEffect(() => {
		if (metadata && metadata !== "Feature Not Enabled") {
			setEditedMetadata(metadata);
		} else if (metadata === "Feature Not Enabled") {
			setEditedMetadata("");
		} else {
			setEditedMetadata("{}");
		}
	}, [metadata]);

	const handleSave = async () => {
		try {
			// Validate JSON
			JSON.parse(editedMetadata || "{}");

			await updateMetadata({ userId, metadata: editedMetadata || "{}" });
			showSuccessToast("Metadata updated successfully");
			setIsEditing(false);
		} catch (error) {
			if (error instanceof SyntaxError) {
				showErrorToast("Invalid JSON format. Please check your metadata.");
			} else {
				showErrorToast("Failed to update metadata");
			}
		}
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
			<MetaDataHeader
				isEditing={isEditing}
				setIsEditing={setIsEditing}
				onSave={handleSave}
				isLoading={isUpdatingMetadata}
			/>
			<MetaDataContent
				isEditing={isEditing}
				value={editedMetadata}
				onChange={setEditedMetadata}
			/>
		</Flex>
	);
}
