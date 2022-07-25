import React from 'react';
import { PropTypes } from "prop-types";
import { Box, Typography } from '@mui/material';

const HelpModalContent = ({modalStyle}) => {
  return (
    <Box sx={{...modalStyle, width: "fit-content", maxWidth: "100vw", maxHeight: "80vh", overflow: "auto"}}>
      <Typography variant="h5" mb={2} sx={{ textAlign: "center" }}>Help information</Typography>
      <Typography variant="h6">What is OwlParser?</Typography>
      <Typography variant="body2" sx={{ textAlign: "justify" }}>The main functionality of OwlParser
          is to make the information in SRM-based ontology files easily available.
      </Typography>
      <Typography variant="h6" mt={1}>What is SRM?</Typography>
      <Typography variant="body2" sx={{ textAlign: "justify" }}>
          SRM stands for information systems security and risk management domain model.
          The purpose of infosystems security and risk management domain model (SRM)
          is to protect the assets of organisation from all damages to infosystem security
          using risk management approach.
      </Typography>
      <img src={'help/SRM_model_view.png'} />
      <Typography variant="h6" mt={1}>How to use the loading page?</Typography>
      <Typography variant="body2" sx={{ textAlign: "justify" }}>
          On the landing page, there is an option to upload an ontology
          file from the computer or from the web using an IRI (Internationalized Resource Identifier).
          Also, there is the option to load example ontology files.
      </Typography>
      <Typography variant="h6" mt={1}>How to use the mapping interfaces?</Typography>
      <Typography variant="body2" sx={{ textAlign: "justify" }}>
        {`The mapping interface is needed for ensuring the correctness of the parsed
          ontology structure.
          When an ontology is loaded, the application then provides an interface to map
          the classes in the loaded ontology to SRM classes, which are pre-filled with guessed mappings.
          The mappings can be changed and must be confirmed to continue. Mapping can be changed by clicking the "Edit"
          button. Then it is possible to enter or choose another relation or class (list of suggestions shows relations
          or classes that are not used in other mappings). When entering something incorrectly, then the default state
          can be restored by clicking "Restore defaults". "Delete" button deletes mapping altogether.
          After clicking "Next" the application
          similarly displays an interface to map the ontology relations to SRM relations. When clicking "Finish",
          the main view of the tool opens.`}
      </Typography>
      <Typography variant="h6" mt={1}>How to use the main view?</Typography>
      <Typography variant="body2" sx={{ textAlign: "justify" }}>
          {`The main view consists of two panels. The left-side panel
          contains the SRM-based navigation tree and provides an option to hide or show the categories of
          SRM classes not present in the loaded ontology. The left-side panel also has a “Threats by category”
          tab which displays the threat classes of the ontology - based on the type of application they target.
          Clicking on a class link in the left panel (from any tab) displays information about that class in
          the right-side panel. Also, clicking on any class link on the right panel opens the information
          about that class.`}
      </Typography>
    </Box>
  );
};

HelpModalContent.propTypes = {
  modalStyle: PropTypes.object.isRequired,
};

export default HelpModalContent;