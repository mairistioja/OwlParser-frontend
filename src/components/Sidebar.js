import { useState } from "react";
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
            <Tab label="SRM" value="tree" />
            <Tab label="Threats" value="lists" />
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
                    <ClassLink classId={id} model={model} renderTypes={false} />
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
                    <ClassLink classId={id} model={model} renderTypes={false} />
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

export default Sidebar;
