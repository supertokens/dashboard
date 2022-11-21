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

import { FC, useContext } from "react";
import { ReactComponent as CloseIcon } from "../../../assets/close-icon.svg";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import Toast, { ToastProps } from "./toast";
import "./toastNotification.scss";

export type ToastNotificationProps = Omit<ToastProps, "contentAfterDisappear"> & {
	iconImage: string;
	toastType: "error" | "success" | "info";
};

export const ToastNotification: FC<ToastNotificationProps> = (props: ToastNotificationProps) => {
	const { iconImage, toastType, children, duration, onDisappear } = props;

	let _duration = 3000;

	if (duration !== undefined) {
		_duration = duration;
	}

	return (
		<Toast
			duration={_duration}
			onDisappear={onDisappear}>
			<div className={`notification notification-${toastType}`}>
				<span className="notification__icon">
					<img
						src={iconImage}
						alt={toastType}
					/>
				</span>
				<span className="notification__info">{children}</span>
				<span
					className="notification__close"
					onClick={onDisappear}>
					<CloseIcon />
				</span>
			</div>
		</Toast>
	);
};

export const ToastNotificationContainer: FC = () => {
	const { toasts, removeToast } = useContext(PopupContentContext);

	return (
		<div className="notification-container">
			{toasts.map((toast) => (
				<ToastNotification
					{...toast}
					key={toast.id}
					onDisappear={() => removeToast(toast.id)}
				/>
			))}
		</div>
	);
};
