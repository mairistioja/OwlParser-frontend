import { Tooltip } from "@mui/material";
import React, { Fragment } from "react";
import { IdLink, srmClassText } from "../misc";
import { srmClassNames } from "../srm";

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
      const container = ancestorId in srmClassNames ? srmClasses : others;
      container.push(ancestorId);
    }
    srmClasses.sort((lhs, rhs) => srmClassNames[lhs] < srmClassNames[rhs]);
    for (const srmClass of srmClasses) {
      if (types.length > 0) types.push(", ");
      types.push(<Fragment key={srmClass}>{srmClassText(srmClass)}</Fragment>);
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
      <IdLink id={classId} model={model} /> {types.length > 0 && <>({types})</>}
    </>
  );
};

export default ClassLink;
