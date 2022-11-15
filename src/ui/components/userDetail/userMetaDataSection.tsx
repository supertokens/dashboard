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
import HighlightJS from "highlight.js";
import TSHighlight from "highlight.js/lib/languages/typescript";
import "highlight.js/scss/dark.scss";
import { useEffect, useState } from "react";
import { updateUserMetaData } from "../../../api/user/metadata";
import { getImageUrl } from "../../../utils";
import IconButton from "../common/iconButton";
import InputField from "../inputField/InputField";
import "./userMetaDataSection.scss";

export type UserMetaDataSectionProps = {
	metadata: string | undefined;
	userId: string;
	refetchData: () => Promise<void>;
};

export const UserMetaDataSection: React.FC<UserMetaDataSectionProps> = ({
	metadata,
	userId,
	refetchData,
}: UserMetaDataSectionProps) => {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [metadataForEditing, setMetaDataForEditing] = useState(metadata);
	const [metaDataUpdateError, setMetaDataUpdateError] = useState<string | undefined>(undefined);

	useEffect(() => {
		HighlightJS.registerLanguage("typescript", TSHighlight);
		HighlightJS.initHighlightingOnLoad();
	}, []);

	const renderMetaDataContent = () => {
		if (metadata === undefined) {
			return "Loading...";
		}

		const highlightedCode = HighlightJS.highlight(metadata, {
			language: "typescript",
		});

		return (
			<code
				className="hljs"
				dangerouslySetInnerHTML={{ __html: highlightedCode.value }}
			/>
		);
	};

	const renderContent = () => {
		if (isEditing && metadata !== undefined) {
			return (
				<div className="metadata-edit-container">
					<InputField
						name="metadata"
						type="text"
						value={metadataForEditing}
						error={metaDataUpdateError}
						handleChange={({ target: { value } }) => {
							setMetaDataForEditing(value);
						}}
					/>
				</div>
			);
		}

		return <div className="metadata-content-container">{renderMetaDataContent()}</div>;
	};

	const onCancelEditing = () => {
		setMetaDataForEditing(metadata);
		setIsEditing(false);
	};

	const onSave = async () => {
		try {
			await updateUserMetaData(userId, metadataForEditing === undefined ? "" : metadataForEditing);
			await refetchData();
			setIsEditing(false);
			// eslint-disable-next-line  @typescript-eslint/no-explicit-any
		} catch (e: any) {
			let errorMessage = "Could not update user meta data";

			if (e.message === "Invalid meta data") {
				errorMessage = "User meta data must be a valid JSON object";
			}

			setMetaDataUpdateError(errorMessage);
		}
	};

	return (
		<div className="panel padding-vertical-24">
			<div className="metadata-header">
				<span className="text-small title">USER METADATA</span>

				{!isEditing && (
					<IconButton
						size="small"
						text="Edit"
						tint="var(--color-link)"
						icon={getImageUrl("edit.svg")}
						onClick={() => {
							setIsEditing(true);
						}}
					/>
				)}

				{isEditing && (
					<div className="metadata-actions actions">
						<button
							className="button outline small"
							onClick={onCancelEditing}>
							Cancel
						</button>
						<button
							className="button link outline small"
							onClick={onSave}>
							Save
						</button>
					</div>
				)}
			</div>
			{renderContent()}
		</div>
	);
};
