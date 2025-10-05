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

import { CheckCircledIcon, CrossCircledIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { Flex } from "@radix-ui/themes";

import Button from "@shared/components/button";

interface EmailVerificationActionsProps {
	readonly isVerified: boolean;
	readonly isSendingEmail: boolean;
	readonly onSendVerificationEmail: () => void;
	readonly onToggleVerification: () => void;
}

export default function EmailVerificationActions({
	isVerified,
	isSendingEmail,
	onSendVerificationEmail,
	onToggleVerification,
}: EmailVerificationActionsProps) {
	return (
		<Flex
			gap="2"
			wrap="wrap">
			<Button
				size="2"
				variant="outline"
				color="gray"
				onClick={onSendVerificationEmail}
				loading={isSendingEmail}
				disabled={isVerified}>
				<EnvelopeClosedIcon />
				Send Verification Mail
			</Button>
			<Button
				size="2"
				variant="outline"
				color={isVerified ? "gray" : "green"}
				onClick={onToggleVerification}>
				{isVerified ? <CrossCircledIcon /> : <CheckCircledIcon />}
				{isVerified ? "Set Unverified" : "Set Verified"}
			</Button>
		</Flex>
	);
}
