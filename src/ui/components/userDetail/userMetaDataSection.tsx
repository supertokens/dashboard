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
import { useCallback, useEffect, useState } from "react";
import { getImageUrl } from "../../../utils";
import { getUserMetaData } from "../../api/user/metadata";
import IconButton from "../common/iconButton";
import "./userMetaDataSection.scss";

export type UserMetaDataSectionProps = {
	userId: string;
};

export const UserMetaDataSection: React.FC<UserMetaDataSectionProps> = ({ userId }: UserMetaDataSectionProps) => {
	const [userMetaData, setUserMetaData] = useState<string | undefined>(undefined);

	const fetchUserMetaData = useCallback(async () => {
		const metaDataResponse = await getUserMetaData(userId);

		if (metaDataResponse === "FEATURE_NOT_ENABLED") {
			setUserMetaData("FEATURE_NOT_ENABLED");
		} else if (metaDataResponse !== undefined) {
			setUserMetaData(JSON.stringify(metaDataResponse));
		} else {
			setUserMetaData("{}");
		}
	}, []);

	useEffect(() => {
		void fetchUserMetaData();
	}, [fetchUserMetaData]);

	const renderContent = () => {
		if (userMetaData === undefined) {
			return "Loading...";
		}

		return <code className="language-javascript">{userMetaData}</code>;
	};

	return (
		<div className="panel padding-vertical-24">
			<div className="header">
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
