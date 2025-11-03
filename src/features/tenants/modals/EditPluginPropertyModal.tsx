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

import { CopyIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";

import { getConnectionUri } from "@shared/utils";
import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import { useToast } from "@shared/components/toast";
import { copyToClipboard } from "@shared/utils/copyToClipboard";
import Button from "@shared/components/button";

import styles from "./EditPluginPropertyModal.module.scss";

interface EditPluginPropertyModalProps {
	open: boolean;
	handleClose: () => void;
	tenantId: string;
	databaseType: "postgres" | "mysql";
}

export default function EditPluginPropertyModal({
	open,
	handleClose,
	tenantId,
	databaseType,
}: EditPluginPropertyModalProps) {
	const { showSuccessToast, showErrorToast } = useToast();

	const command = `curl --location --request PUT '${getConnectionUri()}/recipe/multitenancy/tenant/v2' \\
--header 'api-key: <YOUR-API-KEY>' \\
--header 'Content-Type: application/json' \\
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

	const handleCopy = async () => {
		await copyToClipboard(
			command,
			() => {
				showSuccessToast("Copied", "Command copied to clipboard");
			},
			() => {
				showErrorToast("Failed", "Could not copy to clipboard");
			}
		);
	};

	return (
		<Modal
			size="lg"
			open={open}
			handleClose={handleClose}
			title="Edit Database Properties">
			<Form className={styles["edit-plugin-property-modal"]}>
				<Form.Paper>
					<Text
						size="2"
						mb="4"
						className={styles["edit-plugin-property-modal__description"]}>
						Use the following curl request to modify multiple database properties at once.
					</Text>
					<Flex
						direction="column"
						className={styles["edit-plugin-property-modal__command"]}>
						<Flex
							justify="between"
							align="center"
							mb="2">
							<Text
								size="2"
								weight="bold">
								cURL Command
							</Text>
							<Button
								size="1"
								variant="soft"
								onClick={handleCopy}>
								<CopyIcon />
								Copy
							</Button>
						</Flex>
						<pre className={styles["edit-plugin-property-modal__command__code"]}>
							<code>{command}</code>
						</pre>
					</Flex>
				</Form.Paper>
			</Form>
		</Modal>
	);
}
