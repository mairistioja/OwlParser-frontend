import React from "react";
import Sidebar from "./Sidebar";
import MainView from "./MainView";
import { PropTypes } from "prop-types";

const BrowsingPage = ({ model, onClose }) => {
  return (
    <>
      <Sidebar model={model} />
      <MainView model={model} onClose={onClose} />
    </>
  );
};

BrowsingPage.propTypes = {
  model: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BrowsingPage;
