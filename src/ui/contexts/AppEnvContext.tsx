import React from "react";

interface IAppEnvContext {
	connectionURI: string;
	isDemoConnectionURI: boolean;
}

interface IAppEnvContextProviderProps {
	connectionURI: string;
	children?: React.ReactNode;
}

// The list of possible connection URIs
const DEMO_CONNECTION_URIS = ["try.supertokens.io", "try.supertokens.com"];

const AppEnvContext = React.createContext<IAppEnvContext | null>(null);

export const useAppEnvContext = () => {
	const context = React.useContext(AppEnvContext);
	if (!context) throw "Context must be used within a provider!";
	return context;
};

export const AppEnvContextProvider: React.FC<IAppEnvContextProviderProps> = ({ connectionURI, children }) => {
	const isDemoConnectionUri = (connectionURI: string) => {
		return DEMO_CONNECTION_URIS.some((domains) => connectionURI.includes(domains));
	};

	const contextValue: IAppEnvContext = {
		connectionURI,
		isDemoConnectionURI: isDemoConnectionUri(connectionURI),
	};

	return <AppEnvContext.Provider value={contextValue}>{children}</AppEnvContext.Provider>;
};
