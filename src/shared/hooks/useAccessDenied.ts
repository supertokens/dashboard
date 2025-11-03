/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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

import { useEffect, useState, useCallback } from "react";
import { DASHBOARD_ACCESS_DENIED_EVENT } from "@shared/events/accessDenied";

interface UseAccessDeniedReturn {
	hidePopup: () => void;
	isPopupVisible: boolean;
	popupMessage: string;
}

/**
 * Custom hook for handling access denied popup state and events
 */
export const useAccessDenied = (): UseAccessDeniedReturn => {
	const [isPopupVisible, setIsPopupVisible] = useState(false);
	const [popupMessage, setPopupMessage] = useState("");

	const handleAccessDenied = useCallback(
		(e: CustomEvent) => {
			if (isPopupVisible) return;

			const message = e.detail.message;

			setPopupMessage(message);
			setIsPopupVisible(true);
		},
		[isPopupVisible]
	);

	useEffect(() => {
		window.addEventListener(DASHBOARD_ACCESS_DENIED_EVENT, handleAccessDenied as EventListener);

		return () => {
			window.removeEventListener(DASHBOARD_ACCESS_DENIED_EVENT, handleAccessDenied as EventListener);
		};
	}, [handleAccessDenied]);

	const hidePopup = useCallback(() => {
		if (!isPopupVisible) return;

		setPopupMessage("");
		setIsPopupVisible(false);
	}, [isPopupVisible]);

	return {
		isPopupVisible,
		popupMessage,
		hidePopup,
	};
};
