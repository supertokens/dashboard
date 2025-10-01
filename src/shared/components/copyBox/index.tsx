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

import { useState } from "react";
import { CopyIcon, EyeNoneIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Flex, FlexProps, Text } from "@radix-ui/themes";
import { useToast } from "../toast";
import { copyToClipboard, maskText } from "@utils/copyToClipboard";
import IconButton from "../iconButton";

import "./index.scss";

export default function CopyBox({
	text,
	name,
	masked = false,
	active = false,
	...props
}: {
	text: string;
	name: string;
	masked?: boolean;
	active?: boolean;
} & FlexProps) {
	const { showSuccessToast, showErrorToast } = useToast();
	const [isVisible, setIsVisible] = useState(!masked);

	const renderEyeIcon = () => {
		if (masked) {
			return !isVisible ? (
				<EyeOpenIcon
					onClick={() => setIsVisible(true)}
					className="copy-box__eye-icon"
				/>
			) : (
				<EyeNoneIcon
					onClick={() => setIsVisible(false)}
					className="copy-box__eye-icon"
				/>
			);
		}
		return null;
	};

	return (
		<Flex
			align="center"
			gap="4"
			className="copy-box"
			{...props}>
			<Flex
				align="center"
				gap="4"
				p="1"
				className="copy-box__container">
				<Text
					ml="2"
					className={`copy-box__text ${active ? "copy-box__text--active" : ""}`}>
					{isVisible ? text : maskText(text, "*", 4)}
				</Text>

				<IconButton
					variant="soft"
					color="gray"
					className="copy-box__container__copy-icon">
					<CopyIcon
						onClick={(e) => {
							e.stopPropagation();
							void copyToClipboard(
								text,
								() => {
									showSuccessToast("Success", `${name} copied to your clipboard.`);
								},
								() => {
									showErrorToast(
										"Failed to copy to clipboard",
										`${name} could not be copied to your clipboard.`
									);
								}
							);
						}}
					/>
				</IconButton>
			</Flex>
			{renderEyeIcon()}
		</Flex>
	);
}
