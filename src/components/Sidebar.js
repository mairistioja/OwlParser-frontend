import React from "react";
import NavigationTree from "./NavigationTree";

const Sidebar = ({ info }) => {
  return (
    <div id="sidebar">
      <NavigationTree info={info} />
    </div>
  );
};

export default Sidebar;
