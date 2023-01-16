import { getApiUrl, useFetchData } from "../../utils";

interface IUseMetadataService {
	getUserMetaData: (userId: string) => Promise<string | any>;
	updateUserMetaData: (userId: string, data: string) => Promise<any>;
}

const useMetadataService = (): IUseMetadataService => {
	const fetchData = useFetchData();

	const getUserMetaData = async (userId: string): Promise<string | any> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/metadata"),
			method: "GET",
			query: {
				userId,
			},
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status === "FEATURE_NOT_ENABLED_ERROR") {
				return "FEATURE_NOT_ENABLED_ERROR";
			}

			if (body.status !== "OK") {
				return undefined;
			}

			return body.data;
		}

		return undefined;
	};

	const updateUserMetaData = async (userId: string, data: string) => {
		data = data.replaceAll("\n", "");
		const response = await fetchData({
			url: getApiUrl("/api/user/metadata"),
			method: "PUT",
			config: {
				body: JSON.stringify({
					userId,
					data,
				}),
			},
		});

		if (response.status === 200) {
			return await response.json();
		}

		if (response.status === 400) {
			throw new Error("Invalid meta data");
		}

		throw new Error("Something went wrong");
	};

	return {
		getUserMetaData,
		updateUserMetaData,
	};
};

export default useMetadataService;
