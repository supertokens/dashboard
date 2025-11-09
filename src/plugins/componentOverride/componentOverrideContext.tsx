import React from "react";

import type { ContextType } from "./types";

export const ComponentOverrideContext = React.createContext<ContextType<any>>("IS_DEFAULT");
