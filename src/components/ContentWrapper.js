import React from "react";
import Sidebar from "./Sidebar";
import Content from "./Content";
import { PropTypes } from "prop-types";
import Footer from "./Footer";

const ContentWrapper = ({ model, onClose }) => {
  return (
    <>
      <Sidebar model={model} />
      <Content model={model} onClose={onClose} />
    </>
  );
};

ContentWrapper.propTypes = {
  model: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ContentWrapper;
