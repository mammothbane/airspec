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
import props from "prop-types";

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

// import { useAirSpecInterface } from "hooks/useAirSpecInterface";

function AirSpecControl(props) {
  // function AirSpecControl = ({ connect }, isConnected, {setBlueGreenMode}) => {
  const [dropdown, setDropdown] = useState(null);
  const [specialFuncDropDown, setSpecialFuncDropDown] = useState(null);
  const [specialFuncDropDownAct, setSpecialFuncDropDownAct] = useState(null);

  const [sensorConfigDropDown, setSensorConfigDropDown] = useState(null);
  const [sensorConfigDropDownAct, setSensorConfigDropDownAct] = useState(null);

  const [specialBlueGreenFuncDropDownAct, setSpecialBlueGreenFuncDropDownAct] =
    useState(null);
  const [specialDFUFuncDropDownAct, setSpecialDFUFuncDropDownAct] =
    useState(null);
  const [specialRedFlashFuncDropDownAct, setSpecialRedFlashFuncDropDownAct] =
    useState(null);

  const openDropdown = ({ currentTarget }) => setDropdown(currentTarget);

  const openSpecialFuncDropDown = ({ currentTarget }) =>
    setSpecialFuncDropDown(currentTarget);

  const openSensorConfigDropDown = ({ currentTarget }) =>
    setSensorConfigDropDown(currentTarget);

  const closeSpecialFuncDropDown = ({ currentTarget }) => {
    setSpecialDFUFuncDropDownAct(false);
    setSpecialRedFlashFuncDropDownAct(false);
    setSpecialBlueGreenFuncDropDownAct(false);
    setSpecialFuncDropDown(null);
  };
  const specialFunctionDropdownAct = () => {
    setSpecialFuncDropDownAct(!specialFuncDropDown);
    setSensorConfigDropDownAct(false);
    closeDropdown();
  };
  const sensorConfigurationDropdownAct = () => {
    setSensorConfigDropDownAct(!sensorConfigDropDown);
    setSpecialFuncDropDownAct(false);
    closeDropdown();
  };
  const specialBlueGreenFunctionDropdownAct = () => {
    setSpecialDFUFuncDropDownAct(false);
    setSpecialRedFlashFuncDropDownAct(false);
    setSpecialBlueGreenFuncDropDownAct(true);
    setSpecialFuncDropDown(null);
  };
  const specialDFUFunctionDropdownAct = () => {
    setSpecialDFUFuncDropDownAct(true);
    setSpecialRedFlashFuncDropDownAct(false);
    setSpecialBlueGreenFuncDropDownAct(false);
    setSpecialFuncDropDown(null);
  };
  const specialRedFlashFunctionDropdownAct = () => {
    setSpecialRedFlashFuncDropDownAct(true);
    setSpecialDFUFuncDropDownAct(false);
    setSpecialBlueGreenFuncDropDownAct(false);
    setSpecialFuncDropDown(null);
  };
  const specialFunctionDropdown = () => {
    setSpecialFuncDropDown(!specialFuncDropDown);
    closeDropdown();
  };
  const closeDropdown = () => setDropdown(null);
  const closeSpecialFuncDropdown = () => setSpecialFuncDropDown(null);
  const closeSensorConfigDropdown = () => setSensorConfigDropDown(null);

  const [enableBlueGreenMode, setEnableBlueGreenMode] = useState(true);
  const [enableDFUMode, setEnableDFUMode] = useState(true);
  const [enableRedFlashMode, setEnableRedFlashMode] = useState(true);

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

  // const {
  //   connect,
  //   toggle,
  //   isConnected,
  //   setRedLight,
  //   setBlueGreenMode,
  //   setGreenLight,
  //   setBlueLight,
  //   setColor,
  // } = useAirSpecInterface();

  var [stepSize, setStepSize] = useState(10);
  var [stepMs, setStepMs] = useState(100);
  var [greenMaxIntensity, setGreenMaxIntensity] = useState(200);
  var [blueMaxIntensity, setBlueMaxIntensity] = useState(200);
  var [blueMinIntensity, setBlueMinIntensity] = useState(0);

  var [redMaxIntensity, setRedMaxIntensity] = useState(200);
  var [redFlashPeriod, setRedFlashPeriod] = useState(50);
  var [redFlashDuration, setRedFlashDuration] = useState(10000);

  const toggleSwitch = (event) => {
    setEnableBlueGreenMode(!enableBlueGreenMode);
  };
  const toggleRedFlashModeSwitch = (event) => {
    setEnableRedFlashMode(!enableRedFlashMode);
  };
  const toggleDFUSwitch = (event) => {
    setEnableDFUMode(!enableDFUMode);
  };

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
              <MKButton
                variant="gradient"
                color="primary"
                onClick={openDropdown}
              >
                System Options <Icon sx={dropdownIconStyles}>expand_more</Icon>
              </MKButton>
              <Menu
                anchorEl={dropdown}
                open={Boolean(dropdown)}
                onClose={closeDropdown}
              >
                <MenuItem onClick={sensorConfigurationDropdownAct}>
                  Configure Sensors Subsystems
                </MenuItem>

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
                    color="secondary"
                    onClick={openSpecialFuncDropDown}
                  >
                    Special Functions{" "}
                    <Icon sx={dropdownIconStyles}>expand_more</Icon>
                  </MKButton>
                  <Menu
                    anchorEl={specialFuncDropDown}
                    open={Boolean(specialFuncDropDown)}
                    onClose={closeSpecialFuncDropdown}
                  >
                    <MenuItem onClick={specialDFUFunctionDropdownAct}>
                      DFU Mode
                    </MenuItem>
                    <MenuItem onClick={specialBlueGreenFunctionDropdownAct}>
                      Blue-Green Transition
                    </MenuItem>
                    <MenuItem onClick={specialRedFlashFunctionDropdownAct}>
                      Red Flash
                    </MenuItem>
                  </Menu>
                </Stack>
              ) : null}
              {sensorConfigDropDownAct ? (
                <Stack direction="column" alignItems="left" spacing={1}>
                  <MKButton
                    variant="gradient"
                    color="secondary"
                    onClick={openSensorConfigDropDown}
                  >
                    Sensor Selection{" "}
                    <Icon sx={dropdownIconStyles}>expand_more</Icon>
                  </MKButton>
                  <Menu
                    anchorEl={sensorConfigDropDown}
                    open={Boolean(sensorConfigDropDown)}
                    // onClose={closeSpecialFuncDropdown}
                  >
                    <MenuItem onClick={closeSensorConfigDropdown}>
                      Face Temperature
                    </MenuItem>
                    <MenuItem onClick={closeSensorConfigDropdown}>Blink Sensing</MenuItem>
                    <MenuItem onClick={closeSensorConfigDropdown}>Inertial System</MenuItem>
                    <MenuItem onClick={closeSensorConfigDropdown}>Gas Sensing</MenuItem>
                    <MenuItem onClick={closeSensorConfigDropdown}>
                      Light Intensity Sensor
                    </MenuItem>
                    <MenuItem onClick={closeSensorConfigDropdown}>
                      Light Color Sensor
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
                  <Switch
                    checked={enableBlueGreenMode}
                    onChange={toggleSwitch}
                  />
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
                  value={blueMinIntensity}
                  onChange={(event) => setBlueMinIntensity(event.target.value)}
                  InputProps={{
                    inputProps: { min: 0, max: 255 },
                  }}
                />
                <MKInput
                  type="number"
                  label="Blue Max Intensity"
                  fullWidth
                  value={blueMaxIntensity}
                  onChange={(event) => setBlueMaxIntensity(event.target.value)}
                  InputProps={{
                    inputProps: { min: 0, max: 255 },
                  }}
                />
                <MKInput
                  type="number"
                  label="Green Max Intensity"
                  fullWidth
                  value={greenMaxIntensity}
                  onChange={(event) => setGreenMaxIntensity(event.target.value)}
                  InputProps={{
                    inputProps: { min: 0, max: 255 },
                  }}
                />
                <MKInput
                  type="number"
                  label="Step Size"
                  fullWidth
                  value={stepSize}
                  onChange={(event) => setStepSize(event.target.value)}
                  InputProps={{
                    inputProps: { min: 1, max: 50 },
                  }}
                />
                <MKInput
                  type="number"
                  label="Step Duration (ms)"
                  fullWidth
                  value={stepMs}
                  onChange={(event) => setStepMs(event.target.value)}
                  InputProps={{
                    inputProps: { min: 10, max: 10000, step: 5 },
                  }}
                />
                <MKButton
                  onClick={() =>
                    props.setBlueGreenMode(
                      enableBlueGreenMode,
                      blueMinIntensity,
                      blueMaxIntensity,
                      greenMaxIntensity,
                      stepSize,
                      stepMs
                    )
                  }
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton>
              </Stack>
            ) : null}
            {specialRedFlashFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>
                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={toggleRedFlashModeSwitch}
                >
                  Special Function: Red Flash
                </MKTypography>
                <MKBox display="flex" alignItems="center">
                  <Switch
                    checked={enableRedFlashMode}
                    onChange={toggleRedFlashModeSwitch}
                  />
                  <MKTypography
                    variant="button"
                    color="text"
                    fontWeight="regular"
                    ml={1}
                    sx={{ cursor: "pointer", userSelect: "none" }}
                    onClick={toggleRedFlashModeSwitch}
                  >
                    Enable
                  </MKTypography>
                </MKBox>
                <MKInput
                  type="number"
                  label="Red Intensity"
                  fullWidth
                  value={redMaxIntensity}
                  onChange={(event) => setRedMaxIntensity(event.target.value)}
                  InputProps={{
                    inputProps: { min: 0, max: 255 },
                  }}
                />
                <MKInput
                  type="number"
                  label="Period (ms)"
                  fullWidth
                  value={redFlashPeriod}
                  onChange={(event) => setRedFlashPeriod(event.target.value)}
                  InputProps={{
                    inputProps: { min: 0, max: 255 },
                  }}
                />
                <MKInput
                  type="number"
                  label="Total Duration (ms) (0 = endless)"
                  fullWidth
                  value={redFlashDuration}
                  onChange={(event) => setRedFlashDuration(event.target.value)}
                  InputProps={{
                    inputProps: { min: 0, max: 255 },
                  }}
                />
                <MKButton
                  onClick={() =>
                    props.setRedFlashMode(
                      enableRedFlashMode,
                      redMaxIntensity,
                      redFlashPeriod,
                      redFlashDuration
                    )
                  }
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton>
              </Stack>
            ) : null}
            {specialDFUFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>
                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={toggleDFUSwitch}
                >
                  Special Function: DFU Mode
                </MKTypography>
                {/* <MKBox display="flex" alignItems="center">
                  <Switch
                    checked={enableDFUMode}
                    onChange={toggleDFUSwitch}
                  />
                  <MKTypography
                    variant="button"
                    color="text"
                    fontWeight="regular"
                    ml={1}
                    sx={{ cursor: "pointer", userSelect: "none" }}
                    onClick={toggleDFUSwitch}
                  >
                    Enable
                  </MKTypography>
                </MKBox> */}

                <MKButton
                  onClick={() => props.setDFUMode()}
                  variant="gradient"
                  color="dark"
                >
                  Put System in DFU Mode
                </MKButton>
                <MKTypography
                  // variant="button"
                  variant="subtitle2"
                  color="info"
                  fontWeight="light"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={toggleDFUSwitch}
                >
                  When placed in DFU Mode, Bluetooth will be interrupted but
                  system will be able to be programmed from a USB connection
                  using{" "}
                  <a href="https://www.st.com/en/development-tools/stm32cubeprog.html">
                    STM32CubeProgrammer
                  </a>{" "}
                  Software
                </MKTypography>
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
