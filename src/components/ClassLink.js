import React from "react";
import { IdLink } from "../misc";
import { srmClassNames } from "../srm";

const ClassLink = ({ classId, info, renderTypes = true }) => {
  const types = [];
  if (renderTypes) {
    for (const chain of info.classDerivationChains[classId]) {
      if (chain[0] in srmClassNames) {
        types.push(srmClassNames[chain[0]]);
      } else {
        types.push("Other");
      }
    }
  }
  return (
    <>
      <IdLink id={classId} ontologyId={info.metadata.id} />{" "}
      {types.length > 0 && ` (${types.join(", ")})`}
    </>
  );
};

export default ClassLink;
