import React from "react";
import { protectedComponent } from "../../utils/protectedComponent";

const Home = () => {
  return (
    <h1>Dashboard home</h1>
  );
};

export default protectedComponent(Home);
