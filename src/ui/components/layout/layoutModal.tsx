import { FC, useState } from "react"
import { LayoutPanel, LayoutPanelProps } from "./layoutPanel"

export type LayoutModalProps = LayoutPanelProps & {
  hideBackDrop?: boolean
}

export const LayoutModal: FC<LayoutModalProps> = (props: LayoutModalProps) => {
  const { hideBackDrop } = props;
  const [ isClosed, setIsClosed ] = useState(false)
  return <> { !isClosed &&
    <div className="layout-modal">
      { !hideBackDrop && <div className="layout-modal__backdrop"></div> }
      <LayoutPanel {...props} />   
    </div>
  }</>
}


export default LayoutModal;