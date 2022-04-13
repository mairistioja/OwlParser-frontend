import React from "react";
import Sidebar from "./Sidebar";
import Content from "./Content";
import { PropTypes } from "prop-types";

const ContentWrapper = ({ model, onClose }) => {
  return (
    <div className="wrapper">
      <Sidebar model={model} />
      <Content model={model} onClose={onClose} />
    </div>
  );
};

ContentWrapper.propTypes = {
  model: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ContentWrapper;
