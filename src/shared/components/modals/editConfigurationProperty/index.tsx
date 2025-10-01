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

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import { Flex, Text } from "@radix-ui/themes";

import "./index.scss";
import ItemLabel from "@shared/components/itemLabel";
import ItemValue from "@shared/components/itemValue";
import TextField from "@shared/components/text";
import Callout from "@shared/components/callout";
import Button from "@shared/components/button";

export default function EditConfigurationPropertyModal({
	open,
	handleClose,
}: {
	open: boolean;
	handleClose: () => void;
}) {
	return (
		<Modal
			size="md"
			open={open}
			handleClose={handleClose}
			title="Edit Property">
			<Form className="edit-configuration-property-modal">
				<Flex
					py="4"
					px="3"
					className="edit-configuration-property-modal__heading">
					<ItemLabel
						size="2"
						mr="2"
						weight="medium"
						className="edit-configuration-property-modal__heading__label">
						Property Name:
					</ItemLabel>
					<ItemValue
						size="2"
						className="edit-configuration-property-modal__heading__value">
						email_verification_token_lifetime
					</ItemValue>
				</Flex>
				<Flex
					direction="column"
					gap="4"
					px="3"
					pb="3">
					<Form.Item>
						<ItemLabel
							size="2"
							weight="medium"
							mb="2">
							Value:
						</ItemLabel>
						<TextField
							value="10"
							color="gray"
							size="3"
							variant="surface"
							className="edit-configuration-property-modal__value"
						/>
					</Form.Item>
					<Callout
						color="gray"
						className="edit-configuration-property-modal__callout">
						<Text className="edit-configuration-property-modal__callout__text">
							Time in milliseconds for how long an email verification token / link is valid for. [Default:
							24 * 3600 * 1000 (1 day)]
						</Text>
						<Text
							mt="3"
							className="edit-configuration-property-modal__callout__text--bold">
							Default Value: 86400000
						</Text>
					</Callout>
				</Flex>
			</Form>
			<Flex
				justify="end"
				mt="5">
				<Button size="3">Save</Button>
			</Flex>
		</Modal>
	);
}
