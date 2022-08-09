import { HttpMethod } from "../types";

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
export default class NetworkManager {
  static async doRequest({
    url,
    method,
    query,
    config,
  }: {
    url: string;
    method: HttpMethod;
    query?: { [key: string]: string };
    config?: RequestInit;
  }) {
    if (method === "GET") {
      return this.get(url, query, config);
    }

    return this.post(url, config);
  }

  private static async get(url: string, query?: { [key: string]: string }, config?: RequestInit) {
    const _url: URL = new URL(url);

    // Add query params to URL
    if (query !== undefined) {
      Object.keys(query).forEach((key) => {
        _url.searchParams.append(key, query[key]);
      });
    }

    return fetch(_url, config);
  }

  private static async post(url: string, config?: RequestInit) {
    return fetch(new URL(url), {
      ...config,
      method: "POST",
      headers: {
        ...config?.headers,
        "Content-Type": "application/json",
      },
    });
  }
}
