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

import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { clearValueInStorage, setValueToStorage } from "../../../storageService";
import { apiKeyLocalStorageKey } from "../../../constants";

const Auth: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const promptForApiKey = useCallback(() => {
    clearValueInStorage(apiKeyLocalStorageKey);

    const apiKey = prompt("Please enter your API key");

    if (apiKey !== null && apiKey.length !== 0) {
      // TODO: verify the api key from backend before saving to localstorage
      setValueToStorage(apiKeyLocalStorageKey, apiKey);
      setIsAuthenticated(true);
    } else {
      promptForApiKey();
    }
  }, []);

  useEffect(() => {
    promptForApiKey();
  }, [promptForApiKey]);

  if (isAuthenticated) {
    return <Navigate to="/home" />
  }

  return <></>
};

export default Auth;
