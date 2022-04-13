import { Tooltip } from "@mui/material";
import { NavLink } from "react-router-dom";
import React, { Fragment } from "react";
import { PropTypes } from "prop-types";
import { minimizeOwlId } from "../misc";
import { SrmClassText } from "./SrmClassText";
import SRM from "../srm";

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
        <Tooltip title={others.join(", ")} key={"other"}>
          <span>{types.length > 0 ? "others" : "other"}</span>
        </Tooltip>
      );
    }
  }
  return (
    <>
      <Tooltip title={classId}>
        <NavLink to={{ hash: `#id:${classId}` }}>
          {minimizeOwlId(classId, model)}
        </NavLink>
      </Tooltip>{" "}
      {types.length > 0 && <>({types})</>}
    </>
  );
};

ClassLink.propTypes = {
  classId: PropTypes.string.isRequired,
  model: PropTypes.shape({
    classDerivationChains: PropTypes.objectOf(
      PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
    ).isRequired,
    srmClassOwlIds: PropTypes.objectOf(PropTypes.string).isRequired,
  }).isRequired,
  renderTypes: PropTypes.boolean,
};

export default ClassLink;
