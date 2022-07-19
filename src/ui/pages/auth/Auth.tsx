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
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StorageKeys } from "../../../constants";
import { localStorageHandler } from "../../../services/storage";
import { fetchDataAndRedirectIf401, getApiUrl } from "../../../utils";

const Auth: React.FC<{}> = () => {
    const navigate = useNavigate();

    // This is to avoid double prompts in dev mode because of useEffect
    let didPrompt = false;

    const getApiKeyFromUser = (): string => {
        const apiKey = window.prompt("Please enter API key");

        if (apiKey === null || apiKey.trim().length === 0) {
            return getApiKeyFromUser();
        }

        return `${apiKey}`;
    }

    const promptAndValidateKey = async () => {
        if (didPrompt) {
            return;
        }

        didPrompt = true;

        const apikeyFromUser = getApiKeyFromUser();
        const response = await fetchDataAndRedirectIf401({
            url: getApiUrl("/api/key/validate"),
            method: "POST",
            config: {
                headers: {
                    authorization: `Bearer ${apikeyFromUser}`,
                },
            },
        });

        const body = await response.json();

        if (response.status === 200 && body.status === "OK") {
            localStorageHandler.setItem(StorageKeys.API_KEY, apikeyFromUser);
            navigate("/");
        } else {
            didPrompt = false;
            promptAndValidateKey();
        }
    }

    useEffect(() => {
        // We delete from storage first because the user could have been redirected to auth
        // because of a 401
        localStorageHandler.removeItem(StorageKeys.API_KEY);
        promptAndValidateKey();
    }, [])

    return (
        <div>Loading...</div>
    );
}

export default Auth;