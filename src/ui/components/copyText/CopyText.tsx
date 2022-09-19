import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import { getImageUrl } from '../../../utils'
import TemporaryContent from '../temporaryContent/temporaryContent'
import './CopyText.scss';

/**
 * Get coordinates that is located horizontally on the (right + 8px space) of CopyBox, and vertically centered to the `refElement`
 ** top position also use the CSS `transform: translateY(-50%)`
 * @param popupWidth it is used to prevent the popup to be truncated on the right side of the page
 * @param popupPosition default `right`
 */
export const getPopupPosition = (refElement: HTMLElement | null, popupWidth: number, popupPosition: "bottom" | "right" | "top" = "right", calculateScrollPosition?: boolean) => {
  if (refElement != null) {
    const refElementRect = refElement.getBoundingClientRect();
    console.log((calculateScrollPosition ? document.body.scrollTop : 0));
    console.log(refElementRect.top, (refElementRect.height / 2), (calculateScrollPosition ? document.body.scrollTop : 0));
    
    if (refElementRect !== undefined) {
      const leftPosition = refElementRect.left + (calculateScrollPosition ? document.body.scrollLeft : 0) + refElementRect.width + 8;
      const leftPositionMax = document.body.clientWidth - popupWidth;
      return {
        // top position also use the CSS `transform: translateY(-50%)`
        top: (refElementRect.top + (refElementRect.height / 2) - (calculateScrollPosition ? document.body.scrollTop : 0)) + 'px',
        left: Math.min(leftPosition, leftPositionMax) + 'px'
      } as CSSProperties        
    }
  }
}

export const CopyText: React.FC<{ children: string }> = ({ children }) => { 
  const alertWidth = 80 
  const copyBoxRef = useRef<HTMLDivElement>(null)
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const copyClick = useCallback(() => {
    if (!isCopied) {
      setIsCopied(true)
      navigator.clipboard.writeText(children)
    }
  }, [isCopied, children])

  
  useEffect(() => {
    // hide alert on scroll, otherwise the alert will look not aligned with the CopyBox
    const onScroll = () => setIsCopied(false);
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <span ref={copyBoxRef} className={`copy-text ${isCopied ? 'copy-text-copied' : ''}`} onMouseEnter={() => setIsCopied(false)}>
      <span className='copy-text-text'>{children}</span>
      <span className='copy-text-action' onClick={copyClick}>
        <img src={getImageUrl("copy.svg")} alt="Copy text to clipboard"/>
      </span>
      {isCopied && <TemporaryContent onDisappear={() => setIsCopied(false)}>
        <span className='copy-text-notification' style={getPopupPosition(copyBoxRef.current, alertWidth)}><span className='block-snippet'>Copied!</span></span>
      </TemporaryContent>}
    </span>
  )
}

export default CopyText
