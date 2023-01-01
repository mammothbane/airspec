/*
=========================================================
* Material Kit 2 React - v2.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-kit-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKInput from "components/MKInput";
import MKTypography from "components/MKTypography";

// import { useAirSpecInterface } from "hooks/useAirSpecInterface";

import { useAirSpecInterface } from "hooks/useAirSpecInterface";

function AirSpecControl() {
  const [dropdown, setDropdown] = useState(null);
  const [specialFuncDropDown, setSpecialFuncDropDown] = useState(null);
  const [specialFuncDropDownAct, setSpecialFuncDropDownAct] = useState(null);
  const [specialBlueGreenFuncDropDownAct, setSpecialBlueGreenFuncDropDownAct] =
    useState(null);

  const openDropdown = ({ currentTarget }) => setDropdown(currentTarget);

  const openSpecialFuncDropDown = ({ currentTarget }) =>
    setSpecialFuncDropDown(currentTarget);
  const closeSpecialFuncDropDown = ({ currentTarget }) => {
    setSpecialBlueGreenFuncDropDownAct(false);
    setSpecialFuncDropDown(null);
  };
  const specialFunctionDropdownAct = () => {
    setSpecialFuncDropDownAct(!specialFuncDropDown);
    closeDropdown();
  };
  const specialBlueGreenFunctionDropdownAct = () => {
    setSpecialBlueGreenFuncDropDownAct(true);
    setSpecialFuncDropDown(null);
  };
  const specialFunctionDropdown = () => {
    setSpecialFuncDropDown(!specialFuncDropDown);
    closeDropdown();
  };
  const closeDropdown = () => setDropdown(null);

  const [checked, setChecked] = useState(false);

  // Styles
  const iconStyles = {
    ml: 1,
    fontWeight: "bold",
    transition: "transform 200ms ease-in-out",
  };

  const dropdownIconStyles = {
    transform: dropdown ? "rotate(180deg)" : "rotate(0)",
    ...iconStyles,
  };

  const toggleSwitch = () => setChecked(!checked);

  const {
    connect,
    toggle,
    isConnected,
    setRedLight,
    setBlueGreenMode,
    setGreenLight,
    setBlueLight,
    setColor,
  } = useAirSpecInterface();

  return (
    // <MKBox component="section" py={12}>
    <Stack direction="column" alignItems="left" spacing={1}>
      {/* <Container> */}
      {/* {isConnected ? ( */}
      {true ? (
        <Grid container spacing={1}>
          <Grid item justifyContent="left" xs={12} xm={2} lg={2} />
          <Grid item xs={12} xm={3} lg={3}>
            <Stack direction="column" alignItems="left" spacing={1}>
              <MKButton variant="gradient" color="info" onClick={openDropdown}>
                System Options <Icon sx={dropdownIconStyles}>expand_more</Icon>
              </MKButton>
              <Menu
                anchorEl={dropdown}
                open={Boolean(dropdown)}
                onClose={closeDropdown}
              >
                <MenuItem onClick={closeDropdown}>
                  Configure Sensors Subsystems
                </MenuItem>
                <MenuItem onClick={closeDropdown}>Face Temperature</MenuItem>
                <MenuItem onClick={closeDropdown}>Blink Sensing</MenuItem>
                <MenuItem onClick={closeDropdown}>Inertial System</MenuItem>
                <MenuItem onClick={closeDropdown}>Gas Sensing</MenuItem>
                <MenuItem onClick={closeDropdown}>
                  Light Intensity Sensor
                </MenuItem>
                <MenuItem onClick={closeDropdown}>Light Color Sensor</MenuItem>
                <MenuItem onClick={closeDropdown}>Light Control</MenuItem>
                <MenuItem onClick={specialFunctionDropdownAct}>
                  Special Functions
                </MenuItem>
              </Menu>
              {/* </Grid> */}

              {/* <Divider orientation='horizontal' flexItem></Divider> */}

              {/* </Grid> */}

              {specialFuncDropDownAct ? (
                <Stack direction="column" alignItems="left" spacing={1}>
                  <MKButton
                    variant="gradient"
                    color="info"
                    onClick={openSpecialFuncDropDown}
                  >
                    Special Functions{" "}
                    <Icon sx={dropdownIconStyles}>expand_more</Icon>
                  </MKButton>
                  <Menu
                    anchorEl={specialFuncDropDown}
                    open={Boolean(specialFuncDropDown)}
                    onClose={closeDropdown}
                  >
                    <MenuItem onClick={closeSpecialFuncDropDown}>
                      DFU Mode
                    </MenuItem>
                    <MenuItem onClick={specialBlueGreenFunctionDropdownAct}>
                      Blue-Green Transition
                    </MenuItem>
                    <MenuItem onClick={closeSpecialFuncDropDown}>
                      Red Flash
                    </MenuItem>
                  </Menu>
                </Stack>
              ) : null}
            </Stack>
          </Grid>
          <Grid item justifyContent="left" item xs={12} xm={1} lg={1} />

          <Grid item justifyContent="left" item xs={12} xm={6} lg={6}>
            {specialBlueGreenFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>
                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={toggleSwitch}
                >
                  Special Function: Blue-Green Transition
                </MKTypography>
                <MKBox display="flex" alignItems="center">
                  <Switch checked={checked} onChange={toggleSwitch} />
                  <MKTypography
                    variant="button"
                    color="text"
                    fontWeight="regular"
                    ml={1}
                    sx={{ cursor: "pointer", userSelect: "none" }}
                    onClick={toggleSwitch}
                  >
                    Enable
                  </MKTypography>
                </MKBox>
                <MKInput
                  type="number"
                  label="Blue Min Intensity"
                  fullWidth
                  InputProps={{
                    inputProps: { min: 0, max: 255 },
                  }}
                />
                <MKInput
                  type="number"
                  label="Blue Max Intensity"
                  fullWidth
                  InputProps={{
                    inputProps: { min: 0, max: 255 },
                  }}
                />
                <MKInput
                  type="number"
                  label="Green Max Intensity"
                  fullWidth
                  InputProps={{
                    inputProps: { min: 0, max: 255 },
                  }}
                />
                <MKInput
                  type="number"
                  label="Step Size"
                  fullWidth
                  InputProps={{
                    inputProps: { min: 1, max: 50 },
                  }}
                />
                <MKInput
                  type="number"
                  label="Step Duration (ms)"
                  fullWidth
                  InputProps={{
                    inputProps: { min: 10, max: 10000, step: 5 },
                  }}
                />
                <MKButton onClick={connect} variant="gradient" color="dark">
                  Send Configuration
                </MKButton>
              </Stack>
            ) : null}
          </Grid>
        </Grid>
      ) : (
        <Grid container justifyContent="center">
          <Stack direction="row" alignItems="flex-end" spacing={1}>
            <MKButton variant="gradient" color="dark">
              Connect
            </MKButton>
          </Stack>
          {/* <Stack direction="column" alignItems="right" spacing={1}> 
            <MKButton onClick={connect} variant="gradient" color="success">
              Start Streaming to Server
            </MKButton>
            </Stack> */}
        </Grid>
      )}
      {/* </Container> */}
    </Stack>
  );
}

export default AirSpecControl;
