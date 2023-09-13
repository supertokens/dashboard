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

class RequestQueueManager {
	static requestQueue: { [key: string]: () => Promise<Response> } = {};
	static waiters: { [key: string]: (response: Response) => void } = {};
	static isProcessing = false;

	static addRequestToQueue(request: () => Promise<Response>, waiter: (response: Response) => void): string {
		const id = `${Date.now()}.${Math.floor(Math.random() * 1000)}`;
		RequestQueueManager.requestQueue[id] = request;
		RequestQueueManager.waiters[id] = waiter;
		void this.processRequest();
		return id;
	}

	static async processRequest() {
		if (RequestQueueManager.isProcessing) {
			return;
		}

		if (Object.keys(RequestQueueManager.requestQueue).length === 0) {
			return;
		}

		RequestQueueManager.isProcessing = true;
		const requestId = Object.keys(RequestQueueManager.requestQueue)[0];
		const request = RequestQueueManager.requestQueue[requestId];
		const waiter = RequestQueueManager.waiters[requestId];
		delete RequestQueueManager.requestQueue[requestId];
		delete RequestQueueManager.waiters[requestId];

		const response = await request();
		waiter(response);
		RequestQueueManager.isProcessing = false;
		void RequestQueueManager.processRequest();
	}
}
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
		const queuedRequestFunction = () => {
			if (method === "GET") {
				return this.get(url, query, config);
			}

			if (method === "DELETE") {
				return this.delete(url, query, config);
			}

			/**
			 * If the user's backend has a validation for the request body being missing, it is
			 * possible that it will fail for some of the dashboard requests (for example api
			 * key validation).
			 *
			 * This ensures that a body is always sent to the server even if the API itself does
			 * not consume it
			 */
			let bodyToUse: BodyInit = JSON.stringify({});

			if (config !== undefined && config.body !== null && config.body !== undefined) {
				bodyToUse = config.body;
			}

			return fetch(new URL(url), {
				...config,
				body: bodyToUse,
				method,
				headers: {
					...config?.headers,
					"Content-Type": "application/json",
				},
			});
		};

		let requestCompleted = false;
		let response: Response;

		RequestQueueManager.addRequestToQueue(queuedRequestFunction, (_response) => {
			requestCompleted = true;
			response = _response;
		});

		const waitForResponse = async () => {
			while (!requestCompleted) {
				await new Promise((resolve) => {
					setTimeout(resolve, 10);
				});
			}
		};

		await waitForResponse();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return response;
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

	private static async delete(url: string, query?: { [key: string]: string }, config?: RequestInit) {
		const _url: URL = new URL(url);

		// Add query params to URL
		if (query !== undefined) {
			Object.keys(query).forEach((key) => {
				_url.searchParams.append(key, query[key]);
			});
		}

		return fetch(_url, {
			...config,
			method: "DELETE",
			headers: {
				...config?.headers,
			},
		});
	}
}
