import React from "react";
import { Link } from "react-router-dom";

const Header = ({ model }) => {
  // model.metadata.{id,creator,title,comment,versionIRI,versionInfo}
  return (
    <header>
      <Link to="/">
        <img src="logo.svg" alt="SRM ontology viewer" id="logo" />
      </Link>
      <div id="metadata">
        <h3>{model === null ? "SRM ontology viewer" : model.metadata.title}</h3>
        <p>by {model === null ? "Mai Ristioja" : model.metadata.creator}</p>
      </div>
    </header>
  );
};

export default Header;
