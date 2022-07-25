import { Tooltip } from "@mui/material";
import React from "react";
import { PropTypes } from "prop-types";
import { ActiveClassIdContext } from "../ActiveClassIdContext";
import { minimizeOwlId } from "../misc";

export const ClassLink = ({classId, model, ...props}) => {
  return (
    <ActiveClassIdContext.Consumer>
      {([activeClassId, setActiveClassId]) => {
        let link = (
          <span className="classLink" onClick={() => setActiveClassId(classId)}>
            {minimizeOwlId(classId, model)}
          </span>
        );
        if (!("tooltip" in props)) {
          link = (<Tooltip title={classId} disableInteractive>{link}</Tooltip>);
        } else if (props.tooltip) {
          link = (<Tooltip title={props.tooltip} disableInteractive>{link}</Tooltip>);
        }
        return link;
      }}
    </ActiveClassIdContext.Consumer>
  );
};

ClassLink.propTypes = {
  classId: PropTypes.string.isRequired,
  model: PropTypes.object.isRequired,
  tooltip: PropTypes.node,
};

export default ClassLink;
