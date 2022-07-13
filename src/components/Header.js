import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, IconButton, Menu, MenuItem, Modal, Stack, Tooltip } from "@mui/material";
import React from "react";
import { ReactComponent as Logo } from "../assets/logo.svg";
import { PropTypes } from "prop-types";
import LoadingContainer from "./LoadingContainer";

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const Header = ({
    showMenu,
    handleIriDownload,
    handleUpload
  }) => {
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const handleOpenLoadingModal = () => setOpenLoadingModal(true);
  const handleCloseLoadingModal = () => setOpenLoadingModal(false);
  const [busy, setBusy] = React.useState(false);
  const [anchorMenuEl, setAnchorMenuEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorMenuEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorMenuEl(null);
  };


  const reenableMenu = () => setBusy(false);

  const handleDownload = (iriToDownload) => {
    setBusy(true);
    handleIriDownload(iriToDownload, reenableMenu, reenableMenu, true);
  };


  return (
    <header>
      <Stack spacing={2} direction="row" sx={{alignItems: "center"}}>
        <Logo color="white" id="logo" />
        <div>
          <h3>
            OwlParser: A Web Tool for Parsing and Querying SRM-based Ontology
          </h3>
        </div>
      </Stack>
      <Stack spacing={2} direction="row" sx={{alignItems: "center"}}>
        {showMenu && <Tooltip title="Load ontology">
          <IconButton size="large" onClick={handleClick}>
            <MenuIcon sx={{color:"white"}}/>
          </IconButton>
        </Tooltip>}
        <Tooltip title="Help" sx={{pr: "1rem"}}>
          <IconButton size="large" sx={{pr: "1rem"}}>
            <HelpOutlineIcon sx={{color:"white"}}/>
          </IconButton>
        </Tooltip>
      </Stack>
      <Menu
        anchorEl={anchorMenuEl}
        id="account-menu"
        open={anchorMenuEl !== null}
        disabled={busy}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleOpenLoadingModal}>
          Load new ontology
        </MenuItem>
        <MenuItem onClick={() => handleDownload("samples/healthont_v2.owl")}>
          Open healthOnt.owl
        </MenuItem>
        <MenuItem onClick={() => handleDownload("samples/CordaSecOnt.owl")}>
          Open CordaSecOnt.owl
        </MenuItem>
        <MenuItem onClick={() => handleDownload("samples/ULRO.owl")}>
          Open ULRO.owl
        </MenuItem>
      </Menu>
      <Modal
        open={openLoadingModal}
        onClose={handleCloseLoadingModal}
      >
        <Box sx={modalStyle}>
          <LoadingContainer
            handleIriDownload={(iri, onSuccess, onFailure) =>
              handleIriDownload(
                iri,
                () => {
                  handleCloseLoadingModal();
                  onSuccess();
                },
                onFailure)
            }
            handleUpload={(fileList, onSuccess, onFailure) =>
              handleUpload(
                fileList,
                () => {
                  handleCloseLoadingModal();
                  onSuccess();
                },
                onFailure
              )}/>
        </Box>
      </Modal>
    </header>
  );
};

Header.propTypes = {
  showMenu: PropTypes.bool.isRequired,
  handleIriDownload: PropTypes.func.isRequired,
  handleUpload: PropTypes.func.isRequired
};

export default Header;
