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

import React, { useEffect, useRef, useState } from "react";

type ToastProps = {
	/** duration before the content disappear (in miliseconds)*/
	duration?: number;
	contentAfterDisappear?: React.ReactNode;
	children?: React.ReactNode;
	onDisappear?: () => void;
};
const DEFAULT_TIMER_DURATION = 3000;

/**
 * Simple component that will display one-time content,
 * and then disappears or replaced by `props.contentAfterDisappear` after `props.duration` miliseconds
 */
export const Toast: React.FC<ToastProps> = ({
	duration = DEFAULT_TIMER_DURATION,
	children,
	contentAfterDisappear,
	onDisappear,
}) => {
	const [showChildern, setShowChildern] = useState(true);
	const timerRef: React.MutableRefObject<undefined | NodeJS.Timeout> = useRef(undefined);
	const startTimer = () => {
		timerRef.current = setTimeout(() => {
			setShowChildern(false);
			if (onDisappear !== undefined) {
				onDisappear();
			}
		}, duration) as NodeJS.Timeout;
	};

	useEffect(() => {
		startTimer();
		return () => {
			if (timerRef.current !== undefined) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);
	return <>{showChildern ? children : contentAfterDisappear}</>;
};

export default Toast;
