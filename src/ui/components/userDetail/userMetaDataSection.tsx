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
import { useEffect } from "react";
import { getImageUrl } from "../../../utils";
import IconButton from "../common/iconButton";
import "./userMetaDataSection.scss";

export type UserMetaDataSectionProps = {
	metadata: string | undefined;
};

export const UserMetaDataSection: React.FC<UserMetaDataSectionProps> = ({ metadata }: UserMetaDataSectionProps) => {
	useEffect(() => {
		HighlightJS.registerLanguage("typescript", TSHighlight);
		HighlightJS.initHighlightingOnLoad();
	}, []);

	const renderContent = () => {
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

	return (
		<div className="panel padding-vertical-24">
			<div className="metadata-header">
				<span className="text-small title">USER METADATA</span>
				<IconButton
					size="small"
					text="Edit"
					tint="var(--color-link)"
					icon={getImageUrl("edit.svg")}
				/>
			</div>
			<div className="metadata-content-container">{renderContent()}</div>
		</div>
	);
};
