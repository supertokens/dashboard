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

import { ComponentProps, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StorageKeys } from "../../../constants";
import { localStorageHandler } from "../../../services/storage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AuthWrapper(props: ComponentProps<any>) {
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = localStorageHandler.getItem(StorageKeys.API_KEY);

    if (apiKey === undefined) {
      navigate("/auth");
    } else {
      setIsValidating(false);
    }
  }, [navigate]);

  if (isValidating) {
    return null;
  }

  return props.children;
}
