/* eslint-disable brace-style */

import { CSSProperties } from "react";

/** If empty, the app will decide the position based on the location on the screen using `getAutomaticPopupPosition()` */
export type PopUpPositionType = "bottom" | "right" | "top" | "left";

export type PopUpCSSCoordinateProperties = Required<Pick<CSSProperties, "top" | "left" | "transform">>;

export type PopUpPositionProperties = {
	positionType: PopUpPositionType;
	css: PopUpCSSCoordinateProperties;
};

/**
 * @param popupWidth it is used to prevent the popup to be truncated on the right side of the page
 * @ereturn `PopUpCoordinateProperties` the popup coordinates, additional CSS, and the final value of `popupPosition`
 */
export const getPopupPosition = (
	refElement: HTMLElement | null,
	popupWidth: number,
	popupPosition?: PopUpPositionType,
	calculateScrollPosition?: boolean,
	eligiblePositions?: PopUpPositionType[]
) => {
	if (refElement != null) {
		const rect = refElement.getBoundingClientRect();

		// estimate the position if the `popupPosition` is empty
		if (popupPosition === undefined) {
			popupPosition = getAutomaticPopupPosition(rect, popupWidth, eligiblePositions);
		}

		return {
			css: getPopupCoordinatesAndCSS(rect, popupPosition, calculateScrollPosition),
			positionType: popupPosition,
		} as PopUpPositionProperties;
	}
};

/**
 * estimate the popup position based on the `popupWidth` & the `refElement.rect` position on the screen
 * @param popupWidth it is used to prevent the popup to be truncated on the right side of the page
 */
const getAutomaticPopupPosition: (
	rect: DOMRect,
	popupWidth: number,
	eligiblePositions?: PopUpPositionType[]
) => PopUpPositionType = (rect, popupWidth, eligiblePositions) => {
	const isPositionEligible = (position: PopUpPositionType) =>
		eligiblePositions === undefined || eligiblePositions.includes(position);
	// if there is enough space on right/left then displays on right/left
	if (window.innerWidth - rect.right > popupWidth && isPositionEligible("right")) {
		return "right";
	} else if (rect.left > popupWidth && isPositionEligible("left")) {
		return "left";
	}
	// if there is no enough space on right/left then displays above/below depend on the current position on the screen
	else if (rect.top < window.innerHeight / 2 && isPositionEligible("bottom")) {
		return "bottom";
	}
	return "top";
};

const getPopupCoordinatesAndCSS: (
	rect: DOMRect,
	popupPosition: PopUpPositionType,
	calculateScrollPosition?: boolean
) => PopUpCSSCoordinateProperties = (rect, popupPosition = "right", calculateScrollPosition) => {
	const bottomPosition = rect.bottom - (calculateScrollPosition ? document.body.scrollTop : 0);
	const topPosition = rect.top - (calculateScrollPosition ? document.body.scrollTop : 0);
	const leftPosition = rect.left + (calculateScrollPosition ? document.body.scrollLeft : 0);
	const rightPosition = rect.right - (calculateScrollPosition ? document.body.scrollLeft : 0);
	const spaceToRefElement = 8;

	if (popupPosition === "right" || popupPosition === "left") {
		return {
			top: topPosition + rect.height / 2, // centered vertically
			left: popupPosition === "right" ? rightPosition + spaceToRefElement : leftPosition - spaceToRefElement,
			transform: `translateY(-50%) ${popupPosition === "left" ? "translateX(-100%)" : ""}`,
		};
	}

	return {
		top: popupPosition === "bottom" ? bottomPosition + spaceToRefElement : topPosition - spaceToRefElement,
		left: leftPosition + rect.width / 2, // centered horizontally
		transform: `translateX(-50%) ${popupPosition === "top" ? "translateY(-100%)" : ""}`,
	};
};
