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

import { Box, Flex, TextArea } from "@radix-ui/themes";
import HighlightJS from "highlight.js";

import { METADATA_NOT_ENABLED_TEXT } from "@features/users/components/user-details/metadata/constants";
import styles from "./MetaDataContent.module.scss";

interface MetaDataContentProps {
	readonly isEditing: boolean;
	readonly value: string;
	readonly onChange: (value: string) => void;
	readonly error?: string;
	readonly metadata?: string;
}

export default function MetaDataContent({ isEditing, value, onChange, error, metadata }: MetaDataContentProps) {
	const getFormattedMetaData = (_metadata: string): string => {
		if (_metadata === METADATA_NOT_ENABLED_TEXT) {
			return _metadata;
		}

		try {
			return JSON.stringify(JSON.parse(_metadata), null, 4);
		} catch {
			return _metadata;
		}
	};

	const renderMetaDataContent = () => {
		if (metadata === undefined) {
			return "Loading...";
		}

		const formattedMetadata = getFormattedMetaData(metadata);
		const highlightedCode = HighlightJS.highlight(formattedMetadata, {
			language: "json",
		});

		return (
			<pre>
				<code
					className={`${styles["metadata-content__code"]} hljs`}
					dangerouslySetInnerHTML={{ __html: highlightedCode.value }}
				/>
			</pre>
		);
	};

	if (isEditing) {
		return (
			<Flex
				p="4"
				direction="column"
				className={styles["metadata-content"]}>
				<TextArea
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
					className={styles["metadata-content__textarea"]}
					rows={15}
					placeholder="Enter user metadata as JSON..."
				/>
				{error && (
					<Box mt="2">
						<Flex
							align="center"
							gap="2"
							className={styles["metadata-content__error"]}>
							<span>{error}</span>
						</Flex>
					</Box>
				)}
			</Flex>
		);
	}

	return (
		<Flex
			p="4"
			className={styles["metadata-content"]}>
			<Box className={styles["metadata-content__viewer"]}>{renderMetaDataContent()}</Box>
		</Flex>
	);
}
