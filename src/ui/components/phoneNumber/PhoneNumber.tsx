import { parsePhoneNumberFromString, format } from "libphonenumber-js"
import "./PhoneNumber.scss"

export const PhoneDisplay = ({ phone }: { phone: string }) => {
  const { country, countryCallingCode } = parsePhoneNumberFromString(phone) || {}
  return (
    <>
      {country && (
        <div className='phone-display'>
          <span>
            +{countryCallingCode} {format(phone, 'NATIONAL')}
          </span>
        </div>
      )}
    </>
  )
}

export default PhoneDisplay
