import React from "react";

const LandingPage = () => {
  return (
    <div className="landingContainer">
      <img src="logo.svg" alt="OWL Parser logo"></img>
      <h1>OWL Parser</h1>
      <form>
        <p>Load .owl file from your computer:</p>
        <input type="file"></input>
        <input type="submit">SUBMIT</input>
      </form>
    </div>
  );
};

export default LandingPage;
