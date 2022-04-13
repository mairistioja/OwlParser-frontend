import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@mui/material";
import { srmClasses } from "../srm";

export const SrmClassText = ({ srmClass, model }) => {
  const text = srmClasses[srmClass].name;
  console.assert(srmClass in model.srmClassOwlIds);
  const toolTip =
    model.srmClassOwlIds[srmClass].length > 0
      ? model.srmClassOwlIds[srmClass]
      : `No known equivalent for SRM class "${text}" in given ontology`;
  return (
    <Tooltip title={toolTip}>
      <span>{text}</span>
    </Tooltip>
  );
};

SrmClassText.propTypes = {
  srmClass: PropTypes.string.isRequired,
  model: PropTypes.shape({
    srmClassOwlIds: PropTypes.objectOf(PropTypes.string).isRequired,
  }).isRequired,
};
