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
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StorageKeys, UNAUTHORISED_STATUS } from "../../../constants";
import { localStorageHandler } from "../../../services/storage";
import { fetchData, getApiUrl } from "../../../utils";
import InputField from "../../components/inputField/InputField";

import "./Auth.css";

const Auth: React.FC<Record<string, unknown>> = () => {
  const navigate = useNavigate();

  const [apiKey, setApiKey] = useState("");
  const [apiKeyFieldError, setApiKeyFieldError] = useState("");
  const [loading, setIsLoading] = useState<boolean>(false);

  const validateKey = async () => {
    setIsLoading(true);
    const response = await fetchData({
      url: getApiUrl("/api/key/validate"),
      method: "POST",
      config: {
        headers: {
          authorization: `Bearer ${apiKey}`,
        },
      },
    });

    const body = await response.json();

    if (response.status === 200 && body.status === "OK") {
      localStorageHandler.setItem(StorageKeys.API_KEY, apiKey);
      navigate("/");
    } else if (response.status === UNAUTHORISED_STATUS) {
      setApiKeyFieldError("Invalid API Key.");
    } else {
      setApiKeyFieldError("Something went wrong.");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    // We delete from storage first because the user could have been redirected to auth
    // because of a 401
    localStorageHandler.removeItem(StorageKeys.API_KEY);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (apiKey !== null && apiKey !== undefined && apiKey.length > 0) {
      await validateKey();
    } else {
      setApiKeyFieldError("API Key field cannot be empty.");
    }
  };

  const handleApiKeyFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setApiKey(value);
    setApiKeyFieldError("");
  };

  return (
    <div className="page-container">
      <div className="api-key-form-container">
        <h1 className="api-key-form-title text-title">Enter your API Key</h1>
        <form className="api-key-form" onSubmit={handleSubmit}>
          <InputField
            handleChange={handleApiKeyFieldChange}
            name="apiKey"
            type="text"
            error={apiKeyFieldError}
            label="API Key"
            value={apiKey}
            placeholder="Your API Key"
          />

          <button className="button full-width" type="submit" disabled={loading}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
