import React from "react";
import { ReactComponent as Logo } from "../assets/logo.svg";

const Header = () => {
  // model.metadata.{id,creator,title,comment,versionIRI,versionInfo}
  // TODO confirm reset
  return (
    <header>
      <Logo color="white" id="logo" />
      {/* <div id="metadata">
        <h3>{model === null ? "SRM ontology viewer" : model.metadata.title}</h3>
        <p>by {model === null ? "Mai Ristioja" : model.metadata.creator}</p>
      </div> */}
      <div>
        <h3>
          OwlParser: A Web Tool for Parsing and Querying SRM-based Ontology
        </h3>
      </div>
    </header>
  );
};

export default Header;
