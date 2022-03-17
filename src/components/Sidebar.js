import React from "react";
import NavigationTree from "./NavigationTree";

const Sidebar = ({ model }) => {
  return (
    <div id="sidebar">
      <NavigationTree model={model} />
    </div>
  );
};

export default Sidebar;
