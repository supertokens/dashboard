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
import "highlight.js/scss/an-old-hope.scss";
import { useEffect, useState } from "react";
import useMetadataService from "../../../api/user/metadata";
import { getImageUrl } from "../../../utils";
import IconButton from "../common/iconButton";
import { useUserDetailContext } from "./context/UserDetailContext";
import "./userMetaDataSection.scss";

export const METADATA_NOT_ENABLED_TEXT = "Feature Not Enabled";

export const UserMetaDataSection: React.FC = () => {
	const { hideLoadingOverlay, showLoadingOverlay, userDetail } = useUserDetailContext();
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [metadataForEditing, setMetaDataForEditing] = useState(userDetail.metaData);
	const [metaDataUpdateError, setMetaDataUpdateError] = useState<string | undefined>(undefined);

	const { updateUserMetaData } = useMetadataService();

	useEffect(() => {
		HighlightJS.registerLanguage("typescript", TSHighlight);
		HighlightJS.initHighlightingOnLoad();
	}, []);

	useEffect(() => {
		setMetaDataForEditing(userDetail.metaData);
	}, [userDetail]);

	const getFormattedMetaData = (_metadata: string): string => {
		if (_metadata === METADATA_NOT_ENABLED_TEXT) {
			return _metadata;
		}

		return JSON.stringify(JSON.parse(_metadata), null, 4);
	};

	const renderMetaDataContent = () => {
		if (userDetail.metaData === undefined) {
			return "Loading...";
		}

		const highlightedCode = HighlightJS.highlight(getFormattedMetaData(userDetail.metaData), {
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
		if (isEditing && userDetail.metaData !== undefined) {
			return (
				<div className="metadata-edit-container">
					<textarea
						name={"metadata"}
						defaultValue={metadataForEditing}
						className="metadata-edit-box"
						onChange={({ target: { value } }) => {
							setMetaDataForEditing(value);
						}}
						key={userDetail.metaData}
					/>
					{metaDataUpdateError !== undefined && (
						<div className="input-field-error block-small block-error">
							<img
								className="input-field-error-icon"
								src={getImageUrl("form-field-error-icon.svg")}
								alt="Error in field"
							/>
							<p className="text-small text-error">{metaDataUpdateError}</p>
						</div>
					)}
				</div>
			);
		}

		return <div className="metadata-content-container">{renderMetaDataContent()}</div>;
	};

	const onCancelEditing = () => {
		setMetaDataForEditing(userDetail.metaData);
		setIsEditing(false);
	};

	const onSave = async () => {
		showLoadingOverlay();
		try {
			try {
				// We json parse here to make sure its a valid JSON so that the API does not need to throw a 400
				JSON.parse(metadataForEditing || "{}");
			} catch (_) {
				// This gets handled in the outer catch block
				throw new Error("Invalid meta data");
			}
			setMetaDataUpdateError(undefined);
			await updateUserMetaData(
				userDetail.userId,
				metadataForEditing === undefined || metadataForEditing === "" ? "{}" : metadataForEditing
			);
			await userDetail.func.refetchAllData();
			setIsEditing(false);
			// eslint-disable-next-line  @typescript-eslint/no-explicit-any
		} catch (e: any) {
			let errorMessage = "Could not update user meta data";

			if (e.message === "Invalid meta data") {
				errorMessage = "User meta data must be a valid JSON object";
			}

			setMetaDataUpdateError(errorMessage);
		} finally {
			hideLoadingOverlay();
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
