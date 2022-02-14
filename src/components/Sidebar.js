import React from "react";
import NavigationTree from "./NavigationTree";

const Sidebar = ({ info }) => {
  return (
    <>
      <NavigationTree info={info} />
    </>
  );
};

export default Sidebar;
