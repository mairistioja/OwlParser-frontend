import { Tooltip } from "@mui/material";
import { srmClasses } from "./srm";

export function minimizeOwlId(id, model) {
  const parts = id.split("#", 2);
  return parts[0] === model.metadata.id ? parts[1] : id;
}

export function srmClassText(srmClass, model) {
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
}
