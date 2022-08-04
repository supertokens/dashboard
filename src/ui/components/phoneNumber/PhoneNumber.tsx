import { parsePhoneNumberFromString, format } from "libphonenumber-js"
import "./PhoneNumber.scss"

export const PhoneDisplay = (phone: string) => {
  const { country, countryCallingCode } =
    parsePhoneNumberFromString(phone) || {}
  return (
    country && (
      <div className="phone-display">
        <img
          alt={country}
          src={`https://ipdata.co/flags/${country?.toLowerCase()}.png`}
        />
        +{countryCallingCode} {format(phone, "NATIONAL")}
      </div>
    )
  )
}

export default PhoneDisplay
