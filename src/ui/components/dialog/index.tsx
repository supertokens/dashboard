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

import React from "react";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import { ReactComponent as ErrorIcon } from "../../../assets/form-field-error-icon.svg";

import "./dialog.scss";

type DialogCommonProps = {
	children: React.ReactNode;
	className?: string;
};

type DialogProps = DialogCommonProps & {
	title?: string;
	closeOnOverlayClick?: boolean;
	isError?: boolean;
	onCloseDialog: () => void;
};

function Dialog(props: DialogProps) {
	const { children, className = "", closeOnOverlayClick = false, onCloseDialog, title } = props;

	return (
		<>
			<div
				className="dialog-overlay"
				onClick={() => {
					if (closeOnOverlayClick === true) {
						onCloseDialog();
					}
				}}
			/>
			<div className={`dialog-container ${className}`}>
				{title && (
					<div className="dialog-header">
						<div className="dialog-title">
							{props.isError && <ErrorIcon />}
							{title}
						</div>
						<CloseIcon onClick={onCloseDialog} />
					</div>
				)}
				{children}
			</div>
		</>
	);
}

function DialogContent(props: DialogCommonProps) {
	const { children, className = "" } = props;

	return <div className={`dialog-content ${className}`}>{children}</div>;
}

function DialogConfirmText(props: DialogCommonProps) {
	const { children, className = "" } = props;

	return <p className={`dialog-confirm-text ${className}`}>{children}</p>;
}

type DialogFooterProps = DialogCommonProps & {
	flexDirection?: "row" | "column";
	justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
	border?: "border-top" | "border-none";
};

function DialogFooter(props: DialogFooterProps) {
	const {
		children,
		className = "",
		flexDirection = "row",
		justifyContent = "flex-end",
		border = "border-top",
	} = props;

	return <div className={`dialog-footer ${flexDirection} ${justifyContent} ${border} ${className}`}>{children}</div>;
}

export { Dialog, DialogContent, DialogFooter, DialogConfirmText };
