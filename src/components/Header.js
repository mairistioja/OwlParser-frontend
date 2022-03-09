import React from "react";

const Header = ({ info }) => {
  //creator, title, comment, version
  return (
    <header>
      <img src="logo.svg" alt="OWL parser logo" id="owlLogo"></img>
      <div id="metadata">
        <h3>{info.metadata.title}</h3>
        <p>by {info.metadata.creator}</p>
      </div>
    </header>
  );
};

export default Header;
