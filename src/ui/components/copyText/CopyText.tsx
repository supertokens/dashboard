import { useCallback, useState } from 'react'
import { getImageUrl } from '../../../utils'
import './CopyText.scss'

export const CopyText: React.FC<{ children: string }> = ({ children }) => {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const copyClick = useCallback(() => {
    if (!isCopied) {
      setIsCopied(true)
      navigator.clipboard.writeText(children)
    }
  }, [isCopied, children])
  return (
    <span className={`copy-text ${isCopied ? 'copy-text-copied' : ''}`} onMouseEnter={() => setIsCopied(false)}>
      <span className='copy-text-text'>{children}</span>
      <span className='copy-text-action' onClick={copyClick}>
        <img src={getImageUrl("copy.svg")} alt="Copy text to clipboard"/>
      </span>
      <span className='copy-text-notification' onClick={copyClick}>        
        {/* <span className='block-snippet'>{isCopied ? 'Copied' : 'Copy Text'}</span> */}
      </span>
    </span>
  )
}

export default CopyText
