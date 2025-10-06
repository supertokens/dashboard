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

import { Text } from "@radix-ui/themes";

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";

import styles from "./UneditableConfigurationModal.module.scss";

interface UneditableConfigurationModalProps {
	open: boolean;
	handleClose: () => void;
}

export default function UneditableConfigurationModal({ open, handleClose }: UneditableConfigurationModalProps) {
	return (
		<Modal
			size="md"
			open={open}
			handleClose={handleClose}
			title="Property Cannot be Edited">
			<Form className={styles["uneditable-configuration-modal"]}>
				<Form.Paper>
					<Text
						className={styles["uneditable-configuration-modal__text"]}
						size="2"
						weight="regular">
						This property is configurable only via the config.yaml file or via Docker env variables.
					</Text>
				</Form.Paper>
			</Form>
		</Modal>
	);
}
