import { RdfXmlParser } from "rdfxml-streaming-parser";
import React, { useState } from "react";
import { ReadableWebToNodeStream } from "readable-web-to-node-stream";
import { Button, Box, FormControl, Input, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { PropTypes } from "prop-types";

const LandingPage = ({ setTriples }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [iri, setIri] = useState("");
  const [tabSelected, setTabSelected] = useState("uploadFile");

  const handleTabChange = (event, newTabKey) => {
    setTabSelected(newTabKey);
  };

  function parseStream(readableWebStream) {
    const readableNodeStream = new ReadableWebToNodeStream(readableWebStream);
    const rdfXmlParser = new RdfXmlParser();

    const triples = [];
    rdfXmlParser
      .import(readableNodeStream)
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
        setTriples(triples);
      });
  }

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

    parseStream(file.stream());
  }

  function handleIriDownload(iriToDownload) {
    console.debug(`Downloading: ${iriToDownload}`);
    fetch(iriToDownload, {
      method: "GET",
      headers: { Accept: "application/rdf+xml,*/*" },
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(
            `Server returned failure status: ${response.status} ${response.statusText}`
          );
        return response.body;
      })
      .then((bodyStream) => parseStream(bodyStream))
      .catch((error) => {
        setErrorMessage(
          `Fetching ontology from given IRI failed: ${error.message}`
        );
        setBusy(false);
      });
  }

  return (
    <div className="landingContainer">
      <h1>Load ontology</h1>
      <TabContext value={tabSelected}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleTabChange}>
            <Tab label="Upload file" value="uploadFile" />
            <Tab label="Upload from IRI" value="uploadIri" />
          </TabList>
        </Box>
        <TabPanel value="uploadFile" sx={{ padding: "8px" }}>
          {errorMessage !== "" && (
            <p className="errorMessage">{errorMessage}</p>
          )}
          {busy && <p className="loadingMessage">Loading...</p>}
          <FormControl>
            <p>Load .owl file from your computer:</p>
            <Input
              id="uploadInput"
              type="file"
              disabled={busy}
              onChange={handleUpload}
            />
          </FormControl>
        </TabPanel>
        <TabPanel
          value="uploadIri"
          sx={{
            padding: "8px",
            boxSizing: "border-box",
          }}
        >
          <FormControl>
            <p>Load ontology from IRI:</p>
            <Input
              id="loadInputFromIRI"
              type="url"
              onChange={(event) => setIri(event.target.value)}
              onKeyPress={(event) =>
                event.key === "Enter" && handleIriDownload(iri)
              }
            />
            <Button onClick={() => handleIriDownload(iri)}>Load</Button>
          </FormControl>
        </TabPanel>
      </TabContext>

      <Button
        variant="contained"
        onClick={() => handleIriDownload("samples/healthont_v2.owl")}
        sx={{ mt: "6rem" }}
      >
        Load example
      </Button>
    </div>
  );
};

LandingPage.propTypes = {
  setTriples: PropTypes.func.isRequired,
};

export default LandingPage;
