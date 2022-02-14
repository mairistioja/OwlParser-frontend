import React from "react";
import { IdLink } from "../misc";
import { srmClassNames } from "../srm";

const ClassLink = ({ classId, info, renderTypes = true }) => {
  return (
    <>
      <IdLink id={classId} ontologyId={info.metadata.id} />{" "}
      {renderTypes &&
        ` (${info.classDerivationChains[classId]
          .map((chain) => srmClassNames[chain[0]])
          .join(", ")})`}
    </>
  );
};

export default ClassLink;
