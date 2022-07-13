import { Button, Tooltip } from "@mui/material";
import React, { Fragment } from "react";
import { PropTypes } from "prop-types";
import { minimizeOwlId } from "../misc";
import { SrmClassText } from "./SrmClassText";
import SRM from "../srm";
import { ActiveClassIdContext } from "../ActiveClassIdContext";

const ClassLink = ({ classId, model, renderTypes = true }) => {
  const types = [];
  if (renderTypes) {
    const ancestorIds = [
      // also removes duplicates
      ...new Set(model.classDerivationChains[classId].map((chain) => chain[0])),
    ];
    const srmClasses = [];
    const others = [];
    for (const ancestorId of ancestorIds) {
      const container = ancestorId in SRM.srmClasses ? srmClasses : others;
      container.push(ancestorId);
    }
    srmClasses.sort(
      (lhs, rhs) => SRM.srmClasses[lhs].name < SRM.srmClasses[rhs].name
    );
    for (const srmClass of srmClasses) {
      if (types.length > 0) types.push(", ");
      types.push(
        <Fragment key={srmClass}>
          <SrmClassText srmClass={srmClass} model={model} />
        </Fragment>
      );
    }
    if (others.length > 0) {
      others.sort();
      if (types.length > 0) types.push(" and ");
      types.push(
        <Tooltip title={others.join(", ")} key={"other"} disableInteractive>
          <span>{types.length > 0 ? "others" : "other"}</span>
        </Tooltip>
      );
    }
  }
  return (
    <>
      <ActiveClassIdContext.Consumer>
        {([activeClassId, setActiveClassId]) => (
          <Tooltip title={classId} disableInteractive>
            <span className="classLink" onClick={() => setActiveClassId(classId)}>
              {minimizeOwlId(classId, model)}
            </span>
          </Tooltip>
        )}
      </ActiveClassIdContext.Consumer>{" "}{types.length > 0 && <>({types})</>}
    </>
  );
};

ClassLink.propTypes = {
  classId: PropTypes.string.isRequired,
  model: PropTypes.object.isRequired,
  renderTypes: PropTypes.bool,
};

export default ClassLink;
