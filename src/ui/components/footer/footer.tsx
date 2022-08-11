import { getImageUrl } from '../../../utils'
import './footer.scss'

export type FooterProps = {
  horizontalAlignment?: 'left' | 'center' | 'right'
  verticalAlignment?: 'top' | 'bottom' | 'center'
  colorMode?: 'light' | 'dark'
  size?: 'normal' | 'large'
}

export const Footer = ({ horizontalAlignment, verticalAlignment, colorMode, size }: FooterProps) => {
  return (
    <div
      className={`footer alignment-${horizontalAlignment} vertical-${verticalAlignment} color-${colorMode} size-${size}`}>
      <a
        href='https://supertokens.com/'
        target={'_blank'}
        rel='noreferrer'
        title='SuperTokens, Open Source Authentication'>
        <img src={getImageUrl(`supertokens${colorMode === 'dark' ? '-dark' : ''}.svg`)} alt='Supertokens'></img>
      </a>
    </div>
  )
}
