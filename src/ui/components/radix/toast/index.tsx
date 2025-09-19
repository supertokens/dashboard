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

import React, { createContext } from "react";
import * as Toast from "@radix-ui/react-toast";
import { CheckCircledIcon, Cross2Icon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";

import "./index.scss";

interface ToastMessageProps {
	title: string;
	description?: string;
	open: boolean;
	setOpen: (open: boolean) => void;
	type: "success" | "error";
}

export default function ToastMessage({ title, description, open, setOpen, type }: ToastMessageProps) {
	const toastClass = `toast__root ${type === "error" ? "toast__root--error" : "toast__root--success"}`;

	const icon =
		type === "error" ? (
			<ExclamationTriangleIcon
				width={20}
				height={20}
				color="red"
			/>
		) : (
			<CheckCircledIcon
				width={20}
				height={20}
				color="green"
			/>
		);

	return (
		<Toast.Provider
			swipeDirection="right"
			duration={5000}>
			<Toast.Root
				className={toastClass}
				open={open}
				onOpenChange={setOpen}>
				<Flex
					justify="between"
					align="center"
					width="100%">
					<Flex
						direction="column"
						gap="2">
						<Flex
							align="center"
							gap="2">
							{icon}
							<Text weight="medium">{title}</Text>
						</Flex>
						{description && (
							<Text
								size="2"
								color="gray">
								{description}
							</Text>
						)}
					</Flex>
					<Toast.Close
						className="toast__close"
						aria-label="Close">
						<Cross2Icon
							width={20}
							height={20}
							color="gray"
						/>
					</Toast.Close>
				</Flex>
			</Toast.Root>
			<Toast.Viewport className="toast__viewport" />
		</Toast.Provider>
	);
}

interface ToastContextType {
	showToast: (props: ShowToastProps) => void;
}

interface ShowToastProps {
	type: "success" | "error";
	title: string;
	description?: string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = React.useState(false);
	const [toastProps, setToastProps] = React.useState<ShowToastProps | null>(null);

	const showToast = React.useCallback((props: ShowToastProps) => {
		setToastProps(props);
		setOpen(true);
	}, []);

	React.useEffect(() => {
		if (open) {
			const timer = setTimeout(() => {
				setOpen(false);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [open]);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			{toastProps && (
				<ToastMessage
					open={open}
					setOpen={setOpen}
					title={toastProps.title}
					description={toastProps.description}
					type={toastProps.type}
				/>
			)}
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = React.useContext(ToastContext);
	if (context === undefined) {
		throw new Error("useToast must be used within a ToastProvider");
	}

	const showErrorToast = React.useCallback(
		(title: string, description?: string) => {
			context.showToast({
				type: "error",
				title,
				description,
			});
		},
		[context]
	);

	const showSuccessToast = React.useCallback(
		(title: string, description?: string) => {
			context.showToast({
				type: "success",
				title,
				description,
			});
		},
		[context]
	);

	return {
		...context,
		showErrorToast,
		showSuccessToast,
	};
}
