import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "../../../utils";
import Toast, { ToastProps } from "../toast/toast";
import { PopUpPositionProperties, PopUpPositionType, getPopupPosition } from "./tooltip-util";

const DEFAULT_TOOLTIP_WIDTH = 380;

type TooltipBaseProps = Pick<ToastProps, "children" | "duration" | "onDisappear"> & {
	/** tooltip width in pixel, will get `DEFAULT_TOOLTIP_WIDTH` by default */
	tooltipWidth?: number;
};

type TooltipPopupProps = TooltipBaseProps & { properties?: PopUpPositionProperties };

type TooltipTrigger = "hover" | "click";

type TooltipProps = TooltipBaseProps & {
	/** If empty, the app will decide the position based on the location on the screen using `getAutomaticPopupPosition()` */
	position?: PopUpPositionType;
	/**
	 * Event that triggers the tooltip to be shown
	 * @default "hover"*/
	trigger?: TooltipTrigger;
	/** Tooltip content */
	tooltip: ReactNode;
};

/** The element that will pop out when the `TooltipContainer` is receiving  `TooltipTrigger`*/
export const TooltipPopup: FC<TooltipPopupProps> = ({ duration, children, onDisappear, properties, tooltipWidth }) => {
	// if positioned left/right, then use the `tooltipWidth` value because the there is enough space
	const width =
		properties?.positionType === "left" || properties?.positionType === "right" ? `${tooltipWidth}px` : "auto";

	return (
		<Toast
			duration={duration}
			onDisappear={onDisappear}>
			<div
				className={`tooltip-container__popup popup_${properties?.positionType}`}
				data-theme="dark"
				style={{ maxWidth: `${tooltipWidth}px`, width, ...properties?.css }}>
				{children}
			</div>
		</Toast>
	);
};

/**
 * Element that wraps React Node that listens to `TooltipTrigger` event.
 * If event is triggered, it will display the content of `props.tooltip` on the popup
 * */
export const TooltipContainer: FC<TooltipProps> = (props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { trigger = "hover", children, tooltip, position, tooltipWidth = DEFAULT_TOOLTIP_WIDTH } = props;
	const [isTooltipShown, setIsTooltipShown] = useState<boolean>(false);

	const handleTooltipTrigger = useCallback(
		(triggerType: TooltipTrigger) => {
			// clicking continuesly on the same element is not counted as hover on mobile.
			// Therefore, it uses to click-event on mobile
			if (triggerType === trigger || (isMobile() && triggerType === "click")) {
				setIsTooltipShown(true);
			}
		},
		[trigger]
	);

	const handleMouseLeave = useCallback(() => {
		if (trigger === "hover") {
			setIsTooltipShown(false);
		}
	}, [trigger]);

	useEffect(() => {
		// hide alert on scroll & resize, otherwise the alert will look not aligned with the refElement
		const hideTooltip = () => setIsTooltipShown(false);
		window.removeEventListener("scroll", hideTooltip);
		window.removeEventListener("resize", hideTooltip);
		window.addEventListener("scroll", hideTooltip, { passive: true });
		window.addEventListener("resize", hideTooltip, { passive: true });
		return () => {
			window.removeEventListener("scroll", hideTooltip);
			window.removeEventListener("resize", hideTooltip);
		};
	}, []);

	return (
		<div
			className="tooltip-container"
			onMouseEnter={() => handleTooltipTrigger("hover")}
			onClick={() => handleTooltipTrigger("click")}
			onMouseLeave={handleMouseLeave}
			ref={containerRef}>
			{children}
			{isTooltipShown && (
				<TooltipPopup
					{...props}
					duration={undefined}
					tooltipWidth={tooltipWidth}
					properties={getPopupPosition(containerRef.current, tooltipWidth, position)}
					onDisappear={() => setIsTooltipShown(false)}>
					{tooltip}
				</TooltipPopup>
			)}
		</div>
	);
};

export default TooltipContainer;
