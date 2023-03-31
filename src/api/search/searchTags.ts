import { getApiUrl, useFetchData } from "../../utils";

type resp = {
	status: string;
	tags: string[];
};

interface IUseFetchSearchTagsService {
	fetchSearchTags: () => Promise<resp | undefined>;
}

export const useFetchSearchTags = (): IUseFetchSearchTagsService => {
	const fetchData = useFetchData();
	const fetchSearchTags = async () => {
		const response = await fetchData({
			url: getApiUrl("/api/search/tags"),
			method: "GET",
		});
		return response.ok ? ((await response?.json()) as resp) : undefined;
	};
	return { fetchSearchTags };
};

export default useFetchSearchTags;
