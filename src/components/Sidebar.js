import React, { useState } from "react";
import PropTypes from "prop-types";
import NavigationTree from "./NavigationTree";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tab,
  Typography,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ClassLink from "./ClassLink";

const Sidebar = ({ model }) => {
  const [tabSelected, setTabSelected] = useState("tree");

  const handleTabChange = (event, newTabKey) => {
    setTabSelected(newTabKey);
  };

  return (
    <div id="sidebar">
      <TabContext value={tabSelected} id="sidebar">
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleTabChange}>
            <Tab sx={{fontWeight: 700}} label="SRM" value="tree" />
            <Tab sx={{fontWeight: 700}} label="Threats by category" value="lists" />
          </TabList>
        </Box>
        <TabPanel value="tree" sx={{ padding: "8px" }}>
          <NavigationTree model={model} />
        </TabPanel>
        <TabPanel
          value="lists"
          sx={{
            padding: "8px",
            minWidth: "100%",
            width: "fit-content",
            boxSizing: "border-box",
          }}
        >
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Blockchain application</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              <ul style={{ listStyleType: "none" }}>
                {model.blockchainAppIds.map((id, index) => (
                  <li key={index}>
                    <ClassLink classId={id} model={model} />
                  </li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Traditional application</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              <ul style={{ listStyleType: "none" }}>
                {model.traditionalAppIds.map((id, index) => (
                  <li key={index}>
                    <ClassLink classId={id} model={model} />
                  </li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>
        </TabPanel>
      </TabContext>
    </div>
  );
};

Sidebar.propTypes = {
  model: PropTypes.object.isRequired
};

export default Sidebar;
