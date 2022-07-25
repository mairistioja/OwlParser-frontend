import React from 'react';
import { Button, Typography, Stack } from "@mui/material";
import { PropTypes } from "prop-types";
import { owl_samples } from '../samples';

const ExampleButtons = ({downloadIri}) => {
  return (
    <>
      <Typography variant="h4" component="h2" sx={{marginTop: {xs:"3rem", md: "6rem"}}}>Examples</Typography>

      <Stack spacing={2} direction="row">
        {owl_samples.map((iri, index) => (
          <Button variant="contained" onClick={() => downloadIri(iri, true)} key={index}>
            Load {iri.split("/").slice(-1)}
          </Button>
        ))}
      </Stack>
    </>
  );
};

ExampleButtons.propTypes = {
  downloadIri: PropTypes.func.isRequired
};

export default ExampleButtons;