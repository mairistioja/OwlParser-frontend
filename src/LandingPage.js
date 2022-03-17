import { RdfXmlParser } from "rdfxml-streaming-parser";
import React, { useState } from "react";
import { ReadableWebToNodeStream } from "readable-web-to-node-stream";
import { parseTriples } from "./parsing";
import { useNavigate } from "react-router-dom";

const LandingPage = ({ setModel }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function handleUpload(e) {
    setBusy(true);

    const fileList = e.target.files;
    if (fileList.length <= 0) return;
    console.assert(fileList.length === 1);
    const file = fileList[0];
    const maxSize = 1024 * 1024 * 20;
    if (file.size > maxSize) {
      setErrorMessage(`File "${file.name}" is larger than ${maxSize} bytes!`);
      return;
    }

    const inputStream = new ReadableWebToNodeStream(file.stream());
    const rdfXmlParser = new RdfXmlParser();

    const triples = [];
    rdfXmlParser
      .import(inputStream)
      .on("data", (quad) => {
        triples.push({
          subject: quad.subject,
          predicate: quad.predicate,
          object: quad.object,
        });
      })
      .on("error", (error) => {
        setBusy(false);
        setErrorMessage(`Failed to parse given file: ${error}`);
      })
      .on("end", () => {
        setBusy(false);
        setModel(parseTriples(triples));
        navigate("/browse");
      });
  }
  return (
    <div className="landingContainer">
      <h1>Load ontology</h1>
      {errorMessage !== "" && <p className="errorMessage">{errorMessage}</p>}
      {busy && <p className="loadingMessage">Loading...</p>}
      <form>
        <p>Load .owl file from your computer:</p>
        <input
          id="uploadInput"
          type="file"
          disabled={busy}
          onChange={handleUpload}
        />
      </form>
    </div>
  );
};

export default LandingPage;
