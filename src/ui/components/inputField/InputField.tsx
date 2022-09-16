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
import React, { useCallback, useState } from "react";
import { getImageUrl } from "../../../utils";

import "./InputField.css";

type InputFieldPropTypes = {
  type: "text" | "email" | "password";
  name: string;
  label?: string;
  value: string;
  placeholder?: string;
  error?: string;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
};

const InputField: React.FC<InputFieldPropTypes> = (props) => {
  const handleChange = props.handleChange;
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState(props.value ?? "");
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
      handleChange(event);
    },
    [handleChange]
  );

  return (
    <div className="input-field-container">
      {props.label && (
        <label htmlFor={props.name} className="text-small input-label">
          {props.label}:
        </label>
      )}
      <div
        className={`input-field-inset ${isFocused ? "input-field-inset-focused" : ""} ${
          props.error ? "input-field-inset-error-state" : ""
        }`}>
        <input
          type={props.type === "password" && showPassword ? "text" : props.type}
          name={props.name}
          onChange={onChange}
          value={props.value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`text-small text-black input-field ${props.error ? "input-field-error-state" : ""}`}
          placeholder={props.placeholder}
        />
        <div className="input-field-suffix">
          {props.type === "password" && inputValue.length > 0 && (
            <img
              className="icon"
              onClick={() => setShowPassword(!showPassword)}
              src={getImageUrl(`eye${showPassword ? "-stroke" : ""}.svg`)}
              alt="toggle-visibility"
            />
          )}
        </div>
      </div>
      {props.error && (
        <div className="input-field-error block-small block-error">
          <img className="input-field-error-icon" src={getImageUrl("form-field-error-icon.svg")} alt="Error in field" />
          <p className="text-small text-error">{props.error}</p>
        </div>
      )}
    </div>
  );
};

export default InputField;
