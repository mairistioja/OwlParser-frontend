import { Tooltip } from "@mui/material";
import React, { Fragment } from "react";
import { PropTypes } from "prop-types";
import { minimizeOwlId } from "../misc";
import SRM from "../srm";
import { ActiveClassIdContext } from "../ActiveClassIdContext";
import { insertToSortedUniqueArray } from "../misc";
import { owlIdIsRegular } from "../parsing";

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

export const ClassLinkWithSrmTypes = ({ classId, model, ...props }) => {
  const types = [];
  console.assert(classId in model.classDerivationChains, classId);
  const srmClasses = model.classDerivationChains[classId].reduce(
    (cs, chain) => {
      for (const ancestor of chain)
        if (owlIdIsRegular(ancestor.id))
          for (const srmClass in model.srmClassOwlIds)
            if (ancestor.id === model.srmClassOwlIds[srmClass])
              insertToSortedUniqueArray(
                cs,
                srmClass,
                (lhs, rhs) => SRM.srmClasses[lhs].name < SRM.srmClasses[rhs].name);
      return cs;
    }, []);
  for (const srmClass of srmClasses) {
    if (types.length > 0) types.push(", ");
    const toolTip =
      model.srmClassOwlIds[srmClass]
        ? model.srmClassOwlIds[srmClass]
        : `No known equivalent for SRM class "${srmClasses[srmClass].name}" in given ontology`;
    types.push(
      <Fragment key={srmClass}>
        <Tooltip title={toolTip}>
          <span>{srmClasses[srmClass].name}</span>
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

export default ClassLink;
