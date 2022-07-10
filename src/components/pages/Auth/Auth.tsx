import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

import { clearValueInStorage, setValueToStorage } from "../../../storageService";
import { apiKeyLocalStorageKey } from "../../../constants";

const Auth: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    promptForApiKey();
  }, []);

  const promptForApiKey = () => {
    clearValueInStorage(apiKeyLocalStorageKey);
    console.log("Prompt called");
    const apiKey = prompt("Please enter your API key");
    if (apiKey !== null && apiKey.length !== 0) {
      setValueToStorage(apiKeyLocalStorageKey, apiKey);
      setApiKey(apiKey);
    }
  }

  // return to dashboard home once apiKey is stored in localStorage
  if (apiKey.length > 0) {
    return <Navigate to="/home" />
  }

  return (
    <div>
      <h2>Log in to Dashboard</h2>
      <button onClick={promptForApiKey}>Insert your API Key</button>
    </div>
  )
};

export default Auth;
