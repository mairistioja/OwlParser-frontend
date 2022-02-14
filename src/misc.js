import { NavLink } from "react-router-dom";

export function minimizeOwlId(id, ontologyId) {
  const parts = id.split("#", 2);
  return parts[0] === ontologyId ? parts[1] : id;
}

export function IdLink({ id, ontologyId }) {
  return (
    <NavLink to={{ hash: `#id:${id}` }}>
      {minimizeOwlId(id, ontologyId)}
    </NavLink>
  );
}
