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

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FactorIds, HTTPStatusCodes, StorageKeys } from "../constants";
import { getAccessDeniedEvent } from "../events/accessDenied";
import NetworkManager from "../services/network";
import { localStorageHandler } from "../services/storage";
import { HttpMethod } from "../types";
import { UserRecipeType } from "../ui/pages/usersList/types";
import { ForbiddenError } from "./customErrors";

export function getStaticBasePath(): string {
	return (window as any).staticBasePath;
}

export function getDashboardAppBasePath(): string {
	return (window as any).dashboardAppPath;
}

export function isSearchEnabled(): boolean {
	const searchFlag = (window as any).isSearchEnabled;

	if (searchFlag !== undefined) {
		return searchFlag === "true";
	}

	return false;
}

export function getImageUrl(imageName: string): string {
	return getStaticBasePath() + "/media/" + imageName;
}

export function getApiUrl(path: string, tenantId?: string): string {
	if (!path.startsWith("/")) {
		path = "/" + path;
	}

	let dashboardBasePathToUse = getDashboardAppBasePath();

	if (tenantId !== undefined) {
		dashboardBasePathToUse = dashboardBasePathToUse.replace("/dashboard", `/${tenantId}/dashboard`);
	}

	return window.location.origin + dashboardBasePathToUse + path;
}

export function getConnectionUri() {
	return (window as any).connectionURI;
}

const DEMO_CONNECTION_URIS = ["try.supertokens.io", "try.supertokens.com"];

export const isUsingDemoConnectionUri = (connectionURI: string) => {
	return DEMO_CONNECTION_URIS.some((domains) => connectionURI.includes(domains));
};

interface IFetchDataArgs {
	url: string;
	method: HttpMethod;
	query?: { [key: string]: string };
	config?: RequestInit;
	shouldRedirectOnUnauthorised?: boolean;
	ignoreErrors?: boolean;
}

export const useFetchData = (skipTriggeringErrorBoundary = false) => {
	const [statusCode, setStatusCode] = useState<number>(0);

	const fetchData = async ({
		url,
		method,
		query,
		config,
		shouldRedirectOnUnauthorised = true,
		ignoreErrors = false,
	}: IFetchDataArgs) => {
		const apiKeyInStorage = localStorageHandler.getItem(StorageKeys.AUTH_KEY);

		let additionalHeaders: { [key: string]: string } = {};

		if (apiKeyInStorage !== undefined) {
			additionalHeaders = {
				...additionalHeaders,
				authorization: `Bearer ${apiKeyInStorage}`,
			};
		}

		const response: Response = await NetworkManager.doRequest({
			url,
			method,
			query,
			config: {
				...config,
				headers: {
					...config?.headers,
					...additionalHeaders,
				},
			},
		});

		if (ignoreErrors) {
			return response;
		}

		if (response.status === HTTPStatusCodes.FORBIDDEN) {
			let message = (await response.clone().json())?.message;
			if (message === undefined) {
				message = "You do not have access to this page";
			}
			window.dispatchEvent(getAccessDeniedEvent(message));

			/*	throwing this error just to make sure that this case is handled in some places in the application.
				global search for ForbiddenError.isThisError to see those places
			*/

			throw new ForbiddenError(message);
		}

		const logoutAndRedirect = shouldRedirectOnUnauthorised && HTTPStatusCodes.UNAUTHORIZED === response.status;
		if (logoutAndRedirect) {
			window.localStorage.removeItem(StorageKeys.AUTH_KEY);
			window.location.reload();
		} else {
			setStatusCode(ignoreErrors ? 200 : response.status);
		}
		return response;
	};

	if (
		statusCode < 300 ||
		statusCode === HTTPStatusCodes.UNAUTHORIZED ||
		statusCode === HTTPStatusCodes.FORBIDDEN ||
		skipTriggeringErrorBoundary === true
	) {
		return fetchData;
	}

	throw Error(`Error: ${statusCode}. Some error Occurred`);
};

// Language Utils
const getLanguage = () =>
	(navigator as any).userLanguage ||
	(navigator.languages && navigator.languages.length && navigator.languages[0]) ||
	navigator.language ||
	(navigator as any).browserLanguage ||
	(navigator as any).systemLanguage ||
	"en";

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
	return num.toLocaleString(getLanguage());
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
const DATE_DISPLAY_YEAR_LIMIT = 360;
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

export const getAuthMode = (): "api-key" | "email-password" => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (window as any).authMode; // for now, either "api-key" or "email-password"
};

export const setSelectedTenantId = (tenantId: string) => {
	localStorageHandler.setItem(StorageKeys.TENANT_ID, tenantId);
};

export const getSelectedTenantId = (): string | undefined => {
	return localStorageHandler.getItem(StorageKeys.TENANT_ID);
};

export const useQuery = () => {
	const { search } = useLocation();

	return useMemo(() => new URLSearchParams(search), [search]);
};

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
	let timeout: NodeJS.Timeout | null = null;

	return (...args: Parameters<F>): Promise<ReturnType<F>> =>
		new Promise((resolve) => {
			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = setTimeout(() => resolve(func(...args)), waitFor);
		});
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
export const doesTenantHasPasswordlessEnabled = (tenantFirstFactors: string[]): boolean => {
	return (
		tenantFirstFactors.includes(FactorIds.OTP_EMAIL) ||
		tenantFirstFactors.includes(FactorIds.OTP_PHONE) ||
		tenantFirstFactors.includes(FactorIds.LINK_EMAIL) ||
		tenantFirstFactors.includes(FactorIds.LINK_PHONE)
	);
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
