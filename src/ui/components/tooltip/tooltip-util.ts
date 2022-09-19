import { CSSProperties } from "react";

type PopUpPositionType = "bottom" | "right" | "top" | "left";

type PopUpPositionProperties = {
  top: number,
  left: number,
  css?: CSSProperties
}

/**
 * Get coordinates that is located horizontally on the (right + 8px space) of CopyBox, and vertically centered to the `refElement`
 ** top position also use the CSS `transform: translateY(-50%)`
 * @param popupWidth it is used to prevent the popup to be truncated on the right side of the page
 * @param popupPosition default `right`
 */
 export const getPopupPosition = (refElement: HTMLElement | null, popupPosition: PopUpPositionType = "right", calculateScrollPosition?: boolean) => {
  if (refElement != null) {
    const rect = refElement.getBoundingClientRect();
    console.log((calculateScrollPosition ? document.body.scrollTop : 0));
    console.log(rect.top, (rect.height / 2), (calculateScrollPosition ? document.body.scrollTop : 0));
    
    return getPosition(rect, popupPosition, calculateScrollPosition)
  }
}

const getPosition: (rect: DOMRect, popupPosition: PopUpPositionType, calculateScrollPosition?: boolean) => PopUpPositionProperties = (rect, popupPosition, calculateScrollPosition) => {
  const topPosition = rect.top - (calculateScrollPosition ? document.body.scrollTop : 0);
  const leftPosition = rect.left + (calculateScrollPosition ? document.body.scrollLeft : 0);
  if (popupPosition === "right" || popupPosition === "left") {
    return {
      top: topPosition + (rect.height / 2),
      left: leftPosition  + rect.width + 8,
      css: {
        transform: "translateY(-50%)"
      }
    }
  }
  return {
    top: topPosition + (popupPosition === "bottom" ? rect.height : 0),
    left: leftPosition + (rect.width / 2),
    css: {
      transform: "translateX(-50%)"
    }
  }
}