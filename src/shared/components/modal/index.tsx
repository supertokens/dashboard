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

import { Dialog, Flex } from "@radix-ui/themes";
import React from "react";
import { getImageUrl } from "@utils";

import "./modal.scss";
import Button from "../button";

export function Modal({
	children,
	title,
	handleClose,
	open,
	size = "sm",
}: {
	children: React.ReactNode;
	title: string;
	handleClose: () => void;
	open: boolean;
	size?: "sm" | "lg" | "md";
}) {
	return (
		<Dialog.Root open={open}>
			<Dialog.Content className={`modal modal--${size}`}>
				<Flex
					justify="between"
					align="center"
					mb="6">
					<Dialog.Title
						size="7"
						weight="bold"
						mb="0">
						{title}
					</Dialog.Title>
					<Button
						variant="soft"
						size="1"
						onClick={handleClose}
						tabIndex={-1}
						m="0"
						color="gray"
						className="modal__close-button">
						<img
							src={getImageUrl("cross-2.svg")}
							alt="Close modal"
							className="img-hover"
						/>
					</Button>
				</Flex>
				{children}
			</Dialog.Content>
		</Dialog.Root>
	);
}
