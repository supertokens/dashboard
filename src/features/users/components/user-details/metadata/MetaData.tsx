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

import { useState, useEffect } from "react";
import { Flex } from "@radix-ui/themes";
import HighlightJS from "highlight.js";
import TSHighlight from "highlight.js/lib/languages/typescript";
import "highlight.js/scss/an-old-hope.scss";

import DashboardError from "@shared/components/error";
import Loader from "@shared/components/loader";
import { useToast } from "@shared/components/toast";

import { useMetadata } from "@features/users/hooks/useMetadata";

import MetaDataHeader from "./MetaDataHeader";
import MetaDataContent from "./MetaDataContent";

interface MetaDataProps {
	readonly userId: string;
}

export default function MetaData({ userId }: MetaDataProps) {
	const { metadata, updateMetadata, isUpdatingMetadata, isLoading, error } = useMetadata(userId);
	const { showSuccessToast, showErrorToast } = useToast();

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [editedMetadata, setEditedMetadata] = useState<string>("");
	const [validationError, setValidationError] = useState<string | undefined>(undefined);

	useEffect(() => {
		HighlightJS.registerLanguage("typescript", TSHighlight);
		HighlightJS.initHighlightingOnLoad();
	}, []);

	useEffect(() => {
		if (!metadata) {
			setEditedMetadata("");
			return;
		}

		try {
			const formatted = JSON.stringify(JSON.parse(metadata), null, 4);
			setEditedMetadata(formatted);
		} catch {
			setEditedMetadata(metadata);
		}
	}, [metadata]);

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setValidationError(undefined);

		if (!metadata) {
			setEditedMetadata("");
			return;
		}

		try {
			const formatted = JSON.stringify(JSON.parse(metadata), null, 4);
			setEditedMetadata(formatted);
		} catch {
			setEditedMetadata(metadata);
		}
	};

	const handleSave = async () => {
		try {
			try {
				JSON.parse(editedMetadata || "{}");
			} catch {
				setValidationError("User meta data must be a valid JSON object");
				return;
			}

			setValidationError(undefined);
			await updateMetadata({ userId, metadata: editedMetadata || "{}" });
			showSuccessToast("Metadata updated successfully");
			setIsEditing(false);
		} catch (error) {
			if (error instanceof SyntaxError) {
				setValidationError("User meta data must be a valid JSON object");
			} else {
				showErrorToast("Could not update user meta data");
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
				onEdit={handleEdit}
				onCancel={handleCancel}
				onSave={handleSave}
				isLoading={isUpdatingMetadata}
			/>
			<MetaDataContent
				isEditing={isEditing}
				value={editedMetadata}
				onChange={setEditedMetadata}
				error={validationError}
				metadata={metadata}
			/>
		</Flex>
	);
}
