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
import HighlightJS from "highlight.js";
import BashHighlight from "highlight.js/lib/languages/bash";
import { useEffect, useState } from "react";
import CopyText from "../../../copyText/CopyText";
import { Dialog, DialogConfirmText, DialogContent } from "../../../dialog";
import "./editPluginPropertyDialog.scss";

const commonHeaders = `
--header 'api-key: <YOUR-API-KEY>' \\
--header 'Content-Type: application/json' \\
`;

export const EditPluginPropertyDialog = ({
	onCloseDialog,
	tenantId,
	databaseType,
}: {
	onCloseDialog: () => void;
	tenantId: string;
	databaseType: "postgres" | "mysql";
}) => {
	const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

	useEffect(() => {
		HighlightJS.registerLanguage("bash", BashHighlight);
		HighlightJS.initHighlightingOnLoad();
	}, []);

	useEffect(() => {
		if (showCopiedTooltip) {
			setTimeout(() => {
				setShowCopiedTooltip(false);
			}, 1000);
		}
	}, [showCopiedTooltip]);

	const command = `curl --location --request PUT '${
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).connectionURI
	}/recipe/multitenancy/tenant/v2' \\
${commonHeaders.trim()}
--data-raw '{
    "tenantId": "${tenantId}",
    "coreConfig": {
        "${databaseType === "mysql" ? "mysql_host" : "postgresql_host"}": "localhost",
        "${databaseType === "mysql" ? "mysql_port" : "postgresql_port"}": 5432,
        "${databaseType === "mysql" ? "mysql_user" : "postgresql_user"}": "root",
        "${databaseType === "mysql" ? "mysql_password" : "postgresql_password"}": "root",
        "${databaseType === "mysql" ? "mysql_database_name" : "postgresql_database_name"}": "supertokens"
    }
}'`;

	const highlightedCode = HighlightJS.highlight(command, {
		language: "bash",
	});

	return (
		<Dialog
			title="Edit Database Properties"
			onCloseDialog={onCloseDialog}
			className="dialog-container-650">
			<DialogContent>
				<DialogConfirmText>
					Use the following curl request to modify multiple database properties at once.
				</DialogConfirmText>
				<div className="command-container">
					<code
						className="command with-thin-scrollbar bold-400"
						dangerouslySetInnerHTML={{
							__html: highlightedCode.value,
						}}
					/>
					<div>
						<CopyText showChild={false}>{command}</CopyText>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
