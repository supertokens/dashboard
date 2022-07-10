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

import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

import { clearValueInStorage, setValueToStorage } from "../../../storageService";
import { apiKeyLocalStorageKey } from "../../../constants";

const Auth: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    promptForApiKey();
  }, []);

  const promptForApiKey = () => {
    clearValueInStorage(apiKeyLocalStorageKey);
    console.log("Prompt called");
    const apiKey = prompt("Please enter your API key");
    if (apiKey !== null && apiKey.length !== 0) {
      setValueToStorage(apiKeyLocalStorageKey, apiKey);
      setApiKey(apiKey);
    }
  }

  // return to dashboard home once apiKey is stored in localStorage
  if (apiKey.length > 0) {
    return <Navigate to="/home" />
  }

  return (
    <div>
      <h2>Log in to Dashboard</h2>
      <button onClick={promptForApiKey}>Insert your API Key</button>
    </div>
  )
};

export default Auth;
