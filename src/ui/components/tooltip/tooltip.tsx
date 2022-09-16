import { CSSProperties, FC, ReactNode, useCallback, useRef, useState } from "react";
import { getPopupPosition } from "../copyText/CopyText";
import TemporaryContent, { TemporaryContentProps } from "../temporaryContent/temporaryContent";

type TooltipPopupProps = Pick<TemporaryContentProps, "children" | "duration" | "onDisappear"> & {
  css?: CSSProperties
};

type TooltipTrigger = 'hover' | 'click';

type TooltipProps = TooltipPopupProps & { 
  /** 
   * Event that triggers the tooltip to be shown
   * @default "hover"*/
  trigger?: TooltipTrigger,
  /** Tooltip content */
  tooltip: ReactNode
}

/** The element that will pop out when the `TooltipContainer` is receiving  `TooltipTrigger`*/
export const TooltipPopup: FC<TooltipPopupProps> = ({ duration, children, onDisappear, css }) => {
  return <TemporaryContent duration={ duration } onDisappear={onDisappear}>
    <div className="tooltip-container__popup" style={css}>{children}</div>
  </TemporaryContent>
}

/** Element that wraps React Node that listens to `TooltipTrigger` in order to display the `Tooltip` */
export const TooltipContainer: FC<TooltipProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { trigger = "hover", children, tooltip } = props;
  const [isTooltipShown, setIsTooltipShown] = useState<boolean>(false)
  const handleTooltipTrigger = useCallback((triggerType: TooltipTrigger) => { 
    if (triggerType === trigger) {
      setIsTooltipShown(true)
    }
  }, [ trigger ]);
  const handleMouseLeave = useCallback(() => {if (trigger === "hover") {
    setIsTooltipShown(false)
  }}, [trigger])

  return <div className="tooltip-container" 
    onMouseEnter={() => handleTooltipTrigger("hover")} 
    onClick={() => handleTooltipTrigger("click")}
    onMouseLeave={handleMouseLeave}
    ref={containerRef}>
    { children }
    { isTooltipShown && 
      <TooltipPopup {...props} 
      css={getPopupPosition(containerRef.current, 100)}
      children={tooltip} 
      onDisappear={() => setIsTooltipShown(false)}/>}
  </div>
}

export default TooltipContainer;