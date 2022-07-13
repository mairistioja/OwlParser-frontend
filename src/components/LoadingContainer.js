import React, { useState } from "react";
import { Button, Box, FormControl, Input, Tab, Typography } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { PropTypes } from "prop-types";
import ExampleButtons from "./ExampleButtons";

const LoadingContainer = ({
      handleIriDownload,
      handleUpload,
      loadingPage=false
    }) => {
  const [tabSelected, setTabSelected] = useState("uploadFile");
  const [iri, setIri] = useState("");
  const [busy, setBusy] = useState(false);

  const handleTabChange = (event, newTabKey) => {
    setTabSelected(newTabKey);
  };

  const reenableForm = () => setBusy(false);

  const downloadIri = (iriToDownload, autoMap = false) => {
    setBusy(true);
    handleIriDownload(iriToDownload, reenableForm, reenableForm, autoMap);
  };

  return (
    <div className="loadingContainer">
      <div>
        <Typography variant="h3" component="h1">Load ontology</Typography>
        <TabContext value={tabSelected}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleTabChange}>
              <Tab label="Upload file" value="uploadFile" />
              <Tab label="Upload from IRI" value="uploadIri" />
            </TabList>
          </Box>
          <TabPanel value="uploadFile" sx={{ padding: "8px" }}>
            {busy && <p className="loadingMessage">Loading...</p>}
            <FormControl>
              <p>Load .owl file from your computer:</p>
              <Input
                id="uploadInput"
                type="file"
                disabled={busy}
                onChange={(e) => {
                  setBusy(true);
                  handleUpload(e.target.files, reenableForm, reenableForm);
                }}
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
                  event.key === "Enter" && downloadIri(iri)
                }
              />
              <Button onClick={() => downloadIri(iri)}>Load</Button>
            </FormControl>
          </TabPanel>
        </TabContext>
      </div>

      {loadingPage && <ExampleButtons downloadIri={downloadIri} />}

    </div>
  );
};

LoadingContainer.propTypes = {
  handleIriDownload: PropTypes.func.isRequired,
  handleUpload: PropTypes.func.isRequired,
  loadingPage: PropTypes.bool
};

export default LoadingContainer;
