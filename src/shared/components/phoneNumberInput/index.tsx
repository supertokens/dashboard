/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { CountryCode, E164Number, parsePhoneNumber } from "libphonenumber-js";
import {
	BaseSyntheticEvent,
	ChangeEvent,
	FC,
	FocusEventHandler,
	ForwardedRef,
	ReactNode,
	forwardRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import PhoneInputWithCountrySelect, { getCountryCallingCode } from "react-phone-number-input";
import { Flex, Text } from "@radix-ui/themes";
import { getConnectionUri, getImageUrl, isUsingDemoConnectionUri, useClickOutside } from "@shared/utils";

import "./index.scss";
import { getPopupPosition, PopUpPositionProperties } from "@shared/utils/tooltip";

export type PhoneNumberInputProps = {
	onChange: (phoneNumber: string) => void;
	value?: string;
	error?: string;
	forceShowError?: boolean;
	disabled?: boolean;
	label?: string;
	name?: string;
	className?: string;
};

export type PhoneNumberCountrySelectProps = {
	value?: CountryCode;
	onChange: (value: string | undefined) => void;
	options: {
		value: CountryCode;
		label: string;
	}[];
	iconComponent: React.ComponentClass<{ country: CountryCode; label?: ReactNode }>;
};

type PhoneNumberTextFieldProps = {
	value?: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onFocus: FocusEventHandler<HTMLInputElement>;
	onBlur: FocusEventHandler<HTMLInputElement>;
};

const calculateOptionDropdownPosition = (countrySelectRef: React.RefObject<HTMLDivElement>) => {
	return getPopupPosition(
		countrySelectRef.current,
		0 /** width is ignored because it doesnt use `left` or `right` position */,
		undefined,
		undefined,
		["bottom", "top"]
	);
};

export const PhoneNumberCountrySelect: FC<PhoneNumberCountrySelectProps> = (props: PhoneNumberCountrySelectProps) => {
	// "ZZ" means "International".
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const emptyValue = "ZZ" as any;
	/** `estimatedRowOptionheight` is used to define dropdown's max-height and the option's scroll postion */
	const estimatedRowOptionheight = 36;
	const countrySelectRef = useRef<HTMLDivElement>(null);
	const countrySelectPopupRef = useRef<HTMLDivElement>(null);

	const [isPopupActive, setIsPopupActive] = useState(false);
	const [popUpPosition, setPopUpPosition] = useState<PopUpPositionProperties>();
	const { onChange, options, value: selectedValue, iconComponent: Icon } = props;

	const getRowOptionheight = () =>
		countrySelectPopupRef.current?.querySelector(".phone-number-input__country-select__popup__option")
			?.clientHeight ?? estimatedRowOptionheight;

	/** handle the country code changes */
	const handleChange = useCallback(
		(event: BaseSyntheticEvent, value: string | undefined) => {
			event.stopPropagation();
			setIsPopupActive(false);
			onChange(value === emptyValue ? undefined : value);
		},
		[onChange]
	);

	const togglePopUp = (event: BaseSyntheticEvent) => {
		event.stopPropagation();
		setIsPopupActive(!isPopupActive);
	};

	const updateDropdownOptionPosition = useCallback(() => {
		setPopUpPosition(
			isPopupActive && countrySelectRef.current !== null
				? calculateOptionDropdownPosition(countrySelectRef)
				: undefined
		);
	}, [isPopupActive]);

	useEffect(() => {
		if (isPopupActive && countrySelectPopupRef.current !== null) {
			// scroll option dropdown into the currently selected option when popup is getting active
			const scrollTopPosition =
				getRowOptionheight() *
				Math.max(
					options.findIndex(({ value }) => value === selectedValue),
					0
				);
			countrySelectPopupRef.current.scrollTop = scrollTopPosition;

			// set popup position
			updateDropdownOptionPosition();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		isPopupActive, // update scroll position only if `isPopupActive` changes
	]);

	useClickOutside(countrySelectRef, () => setIsPopupActive(false));

	useEffect(() => {
		// when window is scrolled, update the dropdown position
		window.removeEventListener("scroll", updateDropdownOptionPosition);
		window.addEventListener("scroll", updateDropdownOptionPosition, { passive: true });
		return () => window.removeEventListener("scroll", updateDropdownOptionPosition);
	}, [updateDropdownOptionPosition]);

	// Inplace search implementation.
	useEffect(() => {
		let searchString = "";
		let timeout: NodeJS.Timeout | null = null;

		function searchHandler(e: KeyboardEvent) {
			if (e.key.length === 1 && countrySelectPopupRef.current !== null) {
				searchString += e.key.toLowerCase();
				const scrollTopPosition =
					getRowOptionheight() *
					Math.max(
						options.findIndex(({ label }) => {
							return label.toLowerCase().startsWith(searchString);
						}),
						0
					);

				countrySelectPopupRef.current.scrollTop = scrollTopPosition;
			}
		}

		function resetSearchString() {
			if (timeout !== null) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(() => {
				searchString = "";
			}, 500);
		}

		window.addEventListener("keydown", searchHandler);
		window.addEventListener("keyup", resetSearchString);

		return () => {
			window.removeEventListener("keydown", searchHandler);
			window.removeEventListener("keyup", resetSearchString);
		};
	}, [options]);

	return (
		<div
			className="phone-number-input__country-select"
			onClick={togglePopUp}
			onBlur={() => setIsPopupActive(false)}
			ref={countrySelectRef}>
			<div className="phone-number-input__country-select__current-value">
				<Icon
					country={selectedValue ?? emptyValue}
					label={selectedValue !== undefined ? getCountryCallingCode(selectedValue) : ""}
				/>
				<span>
					<img
						src={getImageUrl("triangle-down.svg")}
						alt="Select Country Code"
					/>
				</span>
			</div>
			<div
				className={`phone-number-input__country-select__popup ${
					isPopupActive ? "phone-number-input__country-select__popup--active" : ""
				}`}
				style={{
					...popUpPosition?.css,
					left: undefined,
					transform: popUpPosition?.positionType === "top" ? "translateY(-100%)" : undefined,
					maxHeight: getRowOptionheight() * 4,
				}}
				ref={countrySelectPopupRef}>
				{options.map(({ value, label }) => (
					<div
						className={`phone-number-input__country-select__popup__option ${
							selectedValue === value ? "phone-number-input__country-select__popup__option--selected" : ""
						}`}
						key={value}
						onClick={(ev) => handleChange(ev, value)}>
						<Icon
							country={value}
							label={label}
						/>
						<span className="phone-number-input__country-select__popup__option__country-name">{label}</span>
						<span className="phone-number-input__country-select__popup__option__country-code">
							+{getCountryCallingCode(value)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

const PhoneNumberTextField: FC<PhoneNumberTextFieldProps> = forwardRef(
	(props: PhoneNumberTextFieldProps, ref: ForwardedRef<HTMLInputElement>) => {
		const { value, onChange, onBlur, onFocus } = props;

		return (
			<input
				ref={ref}
				type="tel"
				autoComplete="tel"
				className="phone-number-input__text-field"
				value={value}
				onBlur={onBlur}
				onFocus={onFocus}
				onChange={onChange}
			/>
		);
	}
);
PhoneNumberTextField.displayName = "PhoneNumberTextField";

export default function PhoneNumberInput(props: PhoneNumberInputProps) {
	const { onChange, value, error, forceShowError, disabled, label, name, className } = props;
	const [isTouched, setIsTouched] = useState(false);

	// call the `onChange` and set form as touched
	const handleChange = useCallback(
		(newValue: E164Number) => {
			onChange(newValue);
			setIsTouched(true);
		},
		[onChange]
	);

	return (
		<Flex
			className={className}
			direction="column"
			width="100%"
			style={{
				pointerEvents: disabled ? "none" : "all",
			}}>
			{label && (
				<label
					htmlFor={name}
					className="phone-number-input__label">
					{label}
				</label>
			)}
			<PhoneInputWithCountrySelect
				className={`phone-number-input ${error !== undefined ? "phone-number-input--error" : ""}`}
				value={value}
				onChange={handleChange}
				international={true}
				focusInputOnCountrySelection={false}
				addInternationalOption={false}
				withCountryCallingCode={false}
				countryCallingCodeEditable={true}
				countrySelectComponent={
					PhoneNumberCountrySelect // use custom component because the default one doesn't display country calling code
				}
				inputComponent={
					PhoneNumberTextField // use custom component because the default one always show country calling code in the text field
				}
			/>
			{(isTouched || forceShowError) && error !== undefined && (
				<Flex
					align="center"
					gap="1"
					className="phone-number-input__error">
					<img
						className="phone-number-input__error__icon"
						src={getImageUrl("form-field-error-icon.svg")}
						alt="Error in field"
					/>
					<Text
						size="1"
						color="red"
						className="phone-number-input__error__text">
						{error}
					</Text>
				</Flex>
			)}
		</Flex>
	);
}

export function PhoneDisplay({ phone }: { phone: string }) {
	const isDemoConnectionURI = isUsingDemoConnectionUri(getConnectionUri());

	if (isDemoConnectionURI) return <Text>{phone}</Text>;
	let finalPhone = phone;

	try {
		const parsed = parsePhoneNumber(phone) || {};
		finalPhone = parsed.formatInternational();
	} catch (_) {
		// ignored
	}

	return (
		<Flex className="phone-number-input__display">
			<Text>{finalPhone}</Text>
		</Flex>
	);
}
