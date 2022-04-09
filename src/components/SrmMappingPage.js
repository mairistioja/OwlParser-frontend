import { useState } from "react";
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from "@mui/material";
import { Clear, Edit, Restore } from "@mui/icons-material";
import { srmClasses, srmRelations } from "../srm";
import { useEffect } from "react";
import SrmMappingSelectDialog from "./SrmMappingSelectDialog";

const SrmMappingPage = ({
  ids,
  heading,
  initialMapping,
  onCancel,
  onDone,
  doneButtonLabel = "Done",
  cancelButtonLabel = "Cancel",
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
      <h1 style={{ marginLeft: "16px" }}>{heading}</h1>
      <List dense={true} className="srmMappingList">
        {Object.entries(mapping).map(([srmId, id], index) => (
          <ListItem key={index}>
            <ListItemText
              primary={buildSrmDisplayLabel(srmId)}
              secondary={id}
            />
            <ListItemSecondaryAction>
              <Tooltip title="Edit">
                <IconButton
                  edge="end"
                  aria-label="edit"
                  disabled={availableIds.length <= 0}
                  onClick={() => openSelectDialog(srmId)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Restore default">
                <IconButton
                  edge="end"
                  aria-label="restore"
                  disabled={mapping[srmId] === initialMapping[srmId]}
                  onClick={() =>
                    setMapping({ ...mapping, [srmId]: initialMapping[srmId] })
                  }
                >
                  <Restore />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  edge="end"
                  aria-label="clear"
                  disabled={mapping[srmId] === ""}
                  onClick={() => setMapping({ ...mapping, [srmId]: "" })}
                >
                  <Clear />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {selectDialogProps !== null && (
        <SrmMappingSelectDialog {...selectDialogProps} />
      )}
      <Button
        variant="contained"
        disabled={Object.keys(mapping).length <= 0}
        onClick={() => onDone(mapping)}
        sx={{ m: 2 }}
      >
        {doneButtonLabel}
      </Button>
      <Button variant="outlined" onClick={onCancel}>
        {cancelButtonLabel}
      </Button>
    </>
  );
};

export default SrmMappingPage;
