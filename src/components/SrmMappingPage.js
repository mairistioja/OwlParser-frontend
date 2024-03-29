import React, { useState } from "react";
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Typography,
} from "@mui/material";
import { Clear, Edit, Restore } from "@mui/icons-material";
import { srmClasses, srmRelations } from "../srm";
import { useEffect } from "react";
import SrmMappingSelectDialog from "./SrmMappingSelectDialog";
import { PropTypes } from "prop-types";

const SrmMappingPage = ({
  ids,
  heading,
  initialMapping,
  onBack,
  onNext,
  onCancel,
  nextButtonLabel = "Next",
}) => {
  const [mapping, setMapping] = useState(initialMapping);
  useEffect(() => {
    setMapping(initialMapping);
  }, [initialMapping]);

  const [selectDialogProps, setSelectDialogProps] = useState(null);
  const [availableIds, setAvailableIds] = useState(
    ids.filter((id) => !Object.values(mapping).includes(id))
  );

  useEffect(() => {
    setAvailableIds(ids.filter((id) => !Object.values(mapping).includes(id)));
  }, [mapping, ids]);

  const buildSrmDisplayLabel = (srmId, prefix = false) => {
    if (srmId in srmClasses) {
      const className = srmClasses[srmId].name;
      return prefix ? "class " + className : className;
    }
    console.assert(srmId in srmRelations);
    const relation = srmRelations[srmId];
    const label = `${relation.name} (${
      srmClasses[relation.fromClass].name
    } \u{2192} ${srmClasses[relation.toClass].name})`;
    return prefix ? "relation " + label : label;
  };

  const openSelectDialog = (srmId) => {
    setSelectDialogProps({
      title: "Select ontology equivalent",
      text: `Please select the ontology equivalent for SRM ${buildSrmDisplayLabel(
        srmId,
        true
      )}.`,
      ids:
        mapping[srmId] === ""
          ? availableIds
          : [...new Set([mapping[srmId], ...availableIds])].sort(),
      defaultId: mapping[srmId],
      onSelectId: (newId) => {
        setSelectDialogProps(null);
        setMapping({ ...mapping, [srmId]: newId });
      },
      onCancel: () => setSelectDialogProps(null),
      open: true,
    });
  };

  return (
    <>
      <div style={{
        paddingLeft: "16px",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
        position: "sticky",
        top: "40pt",
        backgroundColor: "white",
        zIndex: 10,
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"
      }}>
        <h1 style={{margin:"0.3rem 0rem"}}>{heading}</h1>
        <Typography variant="subtitle2" sx={{pl: "2rem", color:"#333"}}>Confirmation of SRM mappings is needed to
          guarantee the correct output.
          Individual mappings can be edited, deleted and restored to auto-detected mappings.
        </Typography>
      </div>
      <List dense={true} className="srmMappingList">
        {Object.entries(mapping)
          .sort(([lhsSrmId, lhsId], [rhsSrmId, rhsId]) => {
            return buildSrmDisplayLabel(lhsSrmId).localeCompare(
              buildSrmDisplayLabel(rhsSrmId),
              "en"
            );
          })
          .map(([srmId, id], index) => (
            <ListItem key={index}>
              <ListItemText
                primary={buildSrmDisplayLabel(srmId)}
                secondary={id}
              />
              <ListItemSecondaryAction>
                <Tooltip title="Edit">
                  <span>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      disabled={availableIds.length <= 0}
                      onClick={() => openSelectDialog(srmId)}
                    >
                      <Edit />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Restore default">
                  <span>
                    <IconButton
                      edge="end"
                      aria-label="restore"
                      disabled={mapping[srmId] === initialMapping[srmId]}
                      onClick={() =>
                        setMapping({
                          ...mapping,
                          [srmId]: initialMapping[srmId],
                        })
                      }
                    >
                      <Restore />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Delete">
                  <span>
                    <IconButton
                      edge="end"
                      aria-label="clear"
                      disabled={mapping[srmId] === ""}
                      onClick={() => setMapping({ ...mapping, [srmId]: "" })}
                    >
                      <Clear />
                    </IconButton>
                  </span>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
      </List>
      {selectDialogProps !== null && (
        <SrmMappingSelectDialog {...selectDialogProps} />
      )}
      <div style={{ position: "sticky",
      bottom: "20pt",
      backgroundColor: "white",
      zIndex: 10,
      boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}>
        <Button variant="outlined" sx={{ m: 2 }} onClick={onBack} disabled={!onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          disabled={Object.keys(mapping).length <= 0}
          onClick={() => onNext(mapping)}
          sx={{ m: 2 }}
        >
          {nextButtonLabel}
        </Button>
        <Button variant="outlined" sx={{ m: 2 }} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </>
  );
};

SrmMappingPage.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.string).isRequired,
  heading: PropTypes.string.isRequired,
  initialMapping: PropTypes.objectOf(PropTypes.string).isRequired,
  onBack: PropTypes.func,
  onNext: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  nextButtonLabel: PropTypes.string,
};

export default SrmMappingPage;
