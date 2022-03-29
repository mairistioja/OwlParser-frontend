import { Tooltip } from "@mui/material";
import { NavLink } from "react-router-dom";
import { srmClassNames, srmClassOwlIds } from "./srm";

export function minimizeOwlId(id, model) {
  const parts = id.split("#", 2);
  return parts[0] === model.metadata.id ? parts[1] : id;
}

export function srmClassText(name) {
  const text = srmClassNames[name];
  console.assert(name in srmClassOwlIds);
  const toolTip =
    srmClassOwlIds[name].length > 0
      ? srmClassOwlIds[name]
      : `No known equivalent for SRM class "${text}" in given ontology`;
  return (
    <Tooltip title={toolTip}>
      <span>{text}</span>
    </Tooltip>
  );
}

export function IdLink({ id, model }) {
  return (
    <Tooltip title={id}>
      <NavLink to={{ hash: `#id:${id}` }}>{minimizeOwlId(id, model)}</NavLink>
    </Tooltip>
  );
}
