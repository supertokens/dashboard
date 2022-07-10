import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { apiKeyLocalStorageKey } from "../../../constants";
import { getValueFromStorage } from "../../../storageService";

const ProtectedRoute = () => {
  const [shouldRedirect, setShouldRedirect] = React.useState(false);

  useEffect(() => {
    const apiKey = getValueFromStorage(apiKeyLocalStorageKey);
    if (apiKey === null || apiKey.length === 0) {
      setShouldRedirect(true);
    }
  }, []);

  if (shouldRedirect) {
    return <><Navigate to="/" /></>;
  }

  return <Outlet />;
};

export default ProtectedRoute;
