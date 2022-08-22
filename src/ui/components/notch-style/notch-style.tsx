import { Helmet } from "react-helmet";

export const NotchStyle = ({ color }: { color: string }) => {
  const htmlProps = {style: `background-color: ${color}`} as any;
  return <Helmet>
    <html {...htmlProps} />
    <meta name="theme-color" content={color}></meta>
  </Helmet>
}

export default NotchStyle;