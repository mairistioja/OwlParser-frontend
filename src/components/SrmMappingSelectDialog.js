import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { useEffect } from "react";

export const SrmMappingSelectDialog = ({
  title,
  text,
  ids,
  defaultId,
  onSelectId,
  onCancel,
  ...other
}) => {
  console.assert(defaultId === "" || ids.includes(defaultId));
  const [value, setValue] = useState(defaultId);
  const [filterText, setFilterText] = useState("");
  const [filteredIds, setFilteredIds] = useState([]);

  useEffect(() => {
    setFilteredIds(
      ids.filter((id) => id.toLowerCase().includes(filterText.toLowerCase()))
    );
  }, [ids, filterText]);

  return (
    <Dialog {...other}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContentText>{text}</DialogContentText>
      <TextField
        focused
        value={filterText}
        onChange={(event) => setFilterText(event.target.value)}
      />
      <DialogContent>
        {filteredIds.length <= 0 ? (
          "No IDs matching filter!"
        ) : (
          <FormControl>
            <RadioGroup
              value={value}
              onChange={(event) => setValue(event.target.value)}
            >
              {filteredIds.map((id, index) => (
                <FormControlLabel
                  key={index}
                  value={id}
                  label={id}
                  control={<Radio />}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          disabled={value.length <= 0}
          onClick={() => onSelectId(value)}
        >
          Confirm
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SrmMappingSelectDialog;
