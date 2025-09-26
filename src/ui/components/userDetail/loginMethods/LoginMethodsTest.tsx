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

import Button from "@components/radix/button";
import IconButton from "@components/radix/iconButton";
import ItemLabel from "@components/radix/itemLabel";
import Paper from "@components/radix/paper";
import Separator from "@components/radix/separator";
import Subtitle from "@components/radix/subtitle";
import { CheckCircledIcon, EnvelopeClosedIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Box, Flex } from "@radix-ui/themes";
import PhoneNumberInput from "@components/radix/phoneNumberInput";
import ItemValue from "@components/radix/itemValue";

import Select from "@components/radix/select";
import { NOOP } from "@utils/noop";

import "./loginMethodsTest.scss";
import { useState } from "react";
import ChangePasswordModal from "@components/radix/modals/changePassword";
import TabSelector from "@components/radix/tabSelector";

const LoginMethodHeader = () => {
	return (
		<Flex
			align="center"
			justify="between"
			px="4"
			py="3">
			<Flex align="center">
				<ItemLabel
					mr="2"
					bold>
					Email Password
				</ItemLabel>
				<Separator
					orientation="vertical"
					mx="2"
				/>
				<ItemLabel
					color="purple"
					bold>
					Public
				</ItemLabel>
				<Separator
					orientation="vertical"
					mx="2"
				/>
				<ItemLabel> 29th March, 12:03 am</ItemLabel>
			</Flex>
			<IconButton
				ml="auto"
				size="2"
				color="red"
				variant="soft">
				<TrashIcon />
			</IconButton>
		</Flex>
	);
};

const LoginMethodEmailRow = () => {
	return (
		<Flex
			align="center"
			gap="2">
			<ItemLabel className="login-method__item-label">Email:</ItemLabel>
			<ItemValue>test@gteetddtdtdtd@test.com</ItemValue>
			<Pencil1Icon />
		</Flex>
	);
};

const LoginMethodPhoneRow = () => {
	return (
		<Flex align="center">
			<ItemLabel
				className="login-method__item-label"
				mr="2">
				Phone Number:
			</ItemLabel>

			<PhoneNumberInput
				value="+1234567890"
				onChange={NOOP}
				forceShowError
				className="login-method__phone-number-input"
				disabled
			/>
			<Pencil1Icon />
		</Flex>
	);
};

const LoginMethodActions = () => {
	const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
	return (
		<Flex
			align="center"
			gap="2">
			<Button
				size="2"
				variant="outline"
				onClick={() => setOpenChangePasswordModal(true)}>
				Change Password
			</Button>
			<Button
				size="2"
				variant="outline"
				color="gray">
				<EnvelopeClosedIcon />
				Send Verification Mail
			</Button>
			<Button
				size="2"
				variant="outline"
				color="green">
				<CheckCircledIcon />
				Set Verified
			</Button>
			<ChangePasswordModal
				open={openChangePasswordModal}
				handleClose={() => setOpenChangePasswordModal(false)}
			/>
		</Flex>
	);
};

const LoginMethod = () => {
	return (
		<Paper
			p="0"
			m="4"
			className="login-method"
			withBackground>
			<LoginMethodHeader />
			<Separator fullWidth />
			<Box
				p="4"
				className="login-methods__main-content">
				<LoginMethodEmailRow />
				<Separator
					my="4"
					fullWidth
				/>
				<LoginMethodPhoneRow />

				<Separator
					my="4"
					fullWidth
				/>
				<LoginMethodActions />
			</Box>
		</Paper>
	);
};

export default function LoginMethods() {
	return (
		<Box width="100%">
			<TabSelector.ContentHeading>
				<Flex
					className="login-methods__header"
					justify="between"
					align="center"
					width="100%">
					<Subtitle>Login methods associated with the user</Subtitle>
					<Flex align="center">
						<ItemLabel mr="2">Select tenant:</ItemLabel>
						<Select
							items={[]}
							onValueChange={NOOP}
							selectedValue={""}
							triggerClassName="login-methods__header__select"
						/>
					</Flex>
				</Flex>
			</TabSelector.ContentHeading>

			<LoginMethod />
		</Box>
	);
}
