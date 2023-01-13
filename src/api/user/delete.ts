import { getApiUrl, useFetchData } from "../../utils";

const useDeleteUser = () => {
	const fetchData = useFetchData();

	const deleteUser = async (userId: string): Promise<{ status: "OK" } | undefined> => {
		const response = await fetchData({
			url: getApiUrl("/api/user"),
			method: "DELETE",
			query: {
				userId,
			},
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status !== "OK") {
				return undefined;
			}

			return body;
		}

		return undefined;
	};

	return {
		deleteUser,
	};
};

export default useDeleteUser;
