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
import { Cross2Icon } from "@radix-ui/react-icons";

import { getImageUrl } from "@shared/utils";

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
			<img
				alt="error"
				src={getImageUrl("error-icon.svg")}
				className="toast__icon"
			/>
		) : (
			<img
				alt="success"
				src={getImageUrl("success-icon.svg")}
				className="toast__icon"
			/>
		);

	return (
		<Toast.Provider
			swipeDirection="right"
			duration={500000}>
			<Toast.Root
				className={toastClass}
				open={open}
				onOpenChange={setOpen}>
				<div className="toast__content">
					<div className="toast__icon-container">{icon}</div>
					<div className="toast__text-content">
						<div className="toast__title">{title}</div>
						{description && <div className="toast__description">{description}</div>}
					</div>
					<Toast.Close
						className="toast__close"
						aria-label="Close">
						<Cross2Icon
							width={16}
							height={16}
						/>
					</Toast.Close>
				</div>
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
