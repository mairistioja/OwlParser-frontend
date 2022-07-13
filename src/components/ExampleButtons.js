import React from 'react';
import { Button, Typography, Stack } from "@mui/material";
import { PropTypes } from "prop-types";

const ExampleButtons = ({downloadIri}) => {
  return (
    <>
      <Typography variant="h4" component="h2" sx={{marginTop: {xs:"3rem", md: "6rem"}}}>Examples</Typography>

      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          onClick={() => downloadIri("samples/healthont_v2.owl", true)}
        >
          Load healthOnt.owl
        </Button>
        <Button
          variant="contained"
          onClick={() => downloadIri("samples/CordaSecOnt.owl", true)}
        >
          Load CordaSecOnt.owl
        </Button>
        <Button
          variant="contained"
          onClick={() => downloadIri("samples/ULRO.owl", true)}
        >
          Load ULRO.owl
        </Button>
      </Stack>
    </>
  );
};

ExampleButtons.propTypes = {
  downloadIri: PropTypes.func.isRequired
};

export default ExampleButtons;