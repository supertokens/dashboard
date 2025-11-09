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

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { HTTPStatusCodes } from "@shared/constants";
import { UserRecipeType } from "@features/users/types";
import { SuperTokens } from "../../supertokens";
import { Implementation } from "../../implementation";

export function getStaticBasePath(): string {
	return SuperTokens.getInstanceOrThrow().getPublicConfig().appInfo.staticBasePath;
}

export function getDashboardAppBasePath(): string {
	return SuperTokens.getInstanceOrThrow().getPublicConfig().appInfo.dashboardBasePath;
}

export function isSearchEnabled(): boolean {
	return SuperTokens.getInstanceOrThrow().getPublicConfig().isSearchEnabled;
}

export function getImageUrl(imageName: string): string {
	return getStaticBasePath() + "/media/" + imageName;
}

export function getApiUrl(path: string, tenantId?: string): string {
	if (!path.startsWith("/")) {
		path = "/" + path;
	}

	const apiRecipePath = `${tenantId ? `/${tenantId}` : ""}/dashboard`;

	const { apiBasePath, apiDomain } = SuperTokens.getInstanceOrThrow().getPublicConfig().appInfo;

	const url = [apiDomain, apiBasePath, apiRecipePath, path]
		.map((part) => part.replace(/^\/+/, "").replace(/\/+$/, ""))
		.join("/");

	return url;
}

export function getConnectionUri() {
	return SuperTokens.getInstanceOrThrow().getPublicConfig().appInfo.connectionURI;
}

export const DEMO_CONNECTION_URIS = ["try.supertokens.io", "try.supertokens.com"];

export const isUsingDemoConnectionUri = (connectionURI: string) => {
	return DEMO_CONNECTION_URIS.some((domains) => connectionURI.includes(domains));
};

export const getAuthMode = (): "api-key" | "email-password" => {
	return SuperTokens.getInstanceOrThrow().getPublicConfig().authMode;
};

export const useFetchData = (skipTriggeringErrorBoundary = false) => {
	const [statusCode, setStatusCode] = useState<number>(0);

	if (
		statusCode < 300 ||
		statusCode === HTTPStatusCodes.UNAUTHORIZED ||
		statusCode === HTTPStatusCodes.FORBIDDEN ||
		skipTriggeringErrorBoundary === true
	) {
		return async (...args: Parameters<typeof Implementation["prototype"]["fetchData"]>) => {
			const { response, statusCode } = await Implementation.getInstanceOrThrow().fetchData(...args);

			if (statusCode) setStatusCode(statusCode);

			return response;
		};
	}

	throw Error(`Error: ${statusCode}. Some error Occurred`);
};

// Number Utils

/**
 * Get Ordinal text from number
 ** 1 -> st
 ** 2 -> nd
 ** 3 -> rd
 ** 4 -> th
 */
export const ordinal = (num: number) => {
	const mod = num % 10;
	const modMap: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
	return num > 10 && num < 14 ? "th" : modMap[mod] ?? "th";
};

/**
 * Format number into string with its thousand separator
 ** example: 100000 -> "100,000"
 */
export const formatNumber = (num: number) => {
	return num.toLocaleString(Implementation.getInstanceOrThrow().getLanguage());
};

// Date Utils
const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

/**
 * Output long date
 ** example: 5th August, 03:35 pm
 * @param date epooch number, or Date object
 */
export const formatLongDate = (date: number | Date) => {
	if (typeof date === "number") {
		date = new Date(date);
	}
	const delimiter = ",";
	const day = date.getDate();
	const hour = date.getHours();

	const currentYear = new Date().getFullYear();

	let yearToDisplay = "";

	if (currentYear !== date.getFullYear()) {
		yearToDisplay = "" + date.getFullYear();
	}

	const meridiem = hour < 12 ? "am" : "pm";
	return `${day}${ordinal(day)} ${months[date.getMonth()]}${yearToDisplay}${delimiter}
${(hour % 12 || 12).toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} ${meridiem}`;
};

export const getFormattedLongDateWithoutTime = (date: number | Date) => {
	if (typeof date === "number") {
		date = new Date(date);
	}
	const day = date.getDate();

	const currentYear = new Date().getFullYear();

	let yearToDisplay = "";

	if (currentYear !== date.getFullYear()) {
		yearToDisplay = "" + date.getFullYear();
	}

	return `${day}${ordinal(day)} ${months[date.getMonth()]} ${yearToDisplay}`;
};

const DAY_IN_MILISECONDS = 1000 * 60 * 60 * 24;
/**
 * Substract two date (date2 - date1), and return value in days unit
 * @returns decimal days value
 */
export const substractDate = (date1: Date, date2: Date) => {
	const diff = date2.getTime() - date1.getTime();
	return diff / DAY_IN_MILISECONDS;
};

/** Layout Utils */

export const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * Hook that alerts clicks outside of the passed ref
 */
export const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
	useEffect(() => {
		/**
		 * Alert if clicked on outside of element
		 */
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && event.target !== null && !ref.current.contains(event.target as Node)) {
				callback();
			}
		};
		// Bind the event listener
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [ref, callback]);
};

export const getRecipeNameFromid = (id: UserRecipeType): string => {
	if (id === "emailpassword") {
		return "Email Password";
	}

	if (id === "passwordless") {
		return "Passwordless";
	}

	return "Third Party";
};

export const useQuery = () => {
	const { search } = useLocation();

	return useMemo(() => new URLSearchParams(search), [search]);
};

export const isValidHttpUrl = (urlToBeValidated: string) => {
	let url;

	try {
		url = new URL(urlToBeValidated);
	} catch (_) {
		return false;
	}

	// To ensure that the URL is an HTTP URL
	return url.protocol === "http:" || url.protocol === "https:";
};

export function usePrevious<T>(value: T) {
	// create a new reference
	const ref = useRef<T>();

	// store current value in ref
	useEffect(() => {
		ref.current = value;
	}, [value]); // only re-run if value changes

	// return previous value (happens before update in useEffect above)
	return ref.current;
}
