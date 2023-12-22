/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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

import { CountryCode, E164Number } from "libphonenumber-js";
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
import { getImageUrl, useClickOutside } from "../../../utils";
import { InputFieldPropTypes } from "../inputField/InputField";
import { PopUpPositionProperties, getPopupPosition } from "../tooltip/tooltip-util";
import "./PhoneNumber.scss";

export type PhoneNumberInputProps = Omit<InputFieldPropTypes, "type" | "handleChange"> & {
	onChange: (phoneNumber: string) => void;
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
		countrySelectPopupRef.current?.querySelector("phone-input__country-select__popup__option")?.clientHeight ??
		estimatedRowOptionheight;

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
	}, []);

	return (
		<div
			className="phone-input__country-select"
			onClick={togglePopUp}
			onBlur={() => setIsPopupActive(false)}
			ref={countrySelectRef}>
			<div className="phone-input__country-select__current-value">
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
				className={`phone-input__country-select__popup ${isPopupActive ? "popup-active" : ""}`}
				style={{
					...popUpPosition?.css,
					left: undefined,
					transform: popUpPosition?.positionType === "top" ? "translateY(-100%)" : undefined,
					maxHeight: getRowOptionheight() * 4,
				}}
				ref={countrySelectPopupRef}>
				{options.map(({ value, label }) => (
					<div
						className={`phone-input__country-select__popup__option ${
							selectedValue === value ? "selected" : ""
						}`}
						key={value}
						onClick={(ev) => handleChange(ev, value)}>
						<Icon
							country={value}
							label={label}
						/>
						<span className="country-name">{label}</span>
						<span className="country-calling-code">+{getCountryCallingCode(value)}</span>
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
				className="PhoneInputInput"
				value={value}
				onBlur={onBlur}
				onFocus={onFocus}
				onChange={onChange}
			/>
		);
	}
);
PhoneNumberTextField.displayName = "PhoneNumberTextField";

export const PhoneNumberInput: FC<PhoneNumberInputProps> = (props: PhoneNumberInputProps) => {
	const { onChange, value, error, forceShowError } = props;
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
		<div>
			<label htmlFor={props.name}>{props.label}</label>
			<PhoneInputWithCountrySelect
				className={`phone-input ${error !== undefined ? "phone-input-error" : ""}`}
				value={value}
				onChange={handleChange}
				international={true}
				addInternationalOption={false}
				withCountryCallingCode={false}
				countryCallingCodeEditable={false}
				countrySelectComponent={
					PhoneNumberCountrySelect // use custom component because the default one doesn't display country calling code
				}
				inputComponent={
					PhoneNumberTextField // use custom component because the default one always show country calling code in the text field
				}></PhoneInputWithCountrySelect>
			{(isTouched || forceShowError) && error !== undefined && (
				<div className="input-field-error block-small block-error">
					<img
						className="input-field-error-icon"
						src={getImageUrl("form-field-error-icon.svg")}
						alt="Error in field"
					/>
					<p className="input-field-error-text text-small text-error">{error}</p>
				</div>
			)}
		</div>
	);
};
