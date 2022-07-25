import { Tooltip } from "@mui/material";
import React, { Fragment } from "react";
import { srmClasses } from "../srm";
import { insertToSortedUniqueArray } from "../misc";
import { owlIdIsRegular } from "../parsing";
import { ClassLink } from "./ClassLink";

export const ClassLinkWithSrmTypes = ({ classId, model, ...props }) => {
  const types = [];
  console.assert(classId in model.classDerivationChains, classId);
  const srmBaseClasses = model.classDerivationChains[classId].reduce(
    (cs, chain) => {
      for (const ancestor of chain)
        if (owlIdIsRegular(ancestor.id))
          for (const srmClass in model.srmClassOwlIds)
            if (ancestor.id === model.srmClassOwlIds[srmClass])
              insertToSortedUniqueArray(
                cs,
                srmClass,
                (lhs, rhs) => srmClasses[lhs].name < srmClasses[rhs].name);
      return cs;
    }, []);
  for (const srmBaseClass of srmBaseClasses) {
    if (types.length > 0) types.push(", ");
    const toolTip =
      model.srmClassOwlIds[srmBaseClass]
        ? model.srmClassOwlIds[srmBaseClass]
        : `No known equivalent for SRM class "${srmClasses[srmBaseClass].name}" in given ontology`;
    types.push(
      <Fragment key={srmBaseClass}>
        <Tooltip title={toolTip}>
          <span>{srmClasses[srmBaseClass].name}</span>
        </Tooltip>
      </Fragment>
    );
  }
  return (
    <>
      <ClassLink classId={classId} model={model} {...props} />{" "}{types.length > 0 && <>({types})</>}
    </>
  );
};

ClassLinkWithSrmTypes.propTypes = { ...ClassLink.propTypes };

export default ClassLinkWithSrmTypes;
