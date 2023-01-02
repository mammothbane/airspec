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

import { useAirSpecInterface } from "hooks/useAirSpecInterface";

import AirSpecControl from "../../bluetooth/sensor";

function ButtonsBluetooth() {
  const {
    connect,
    isConnected,
    sysInfo,
    toggle,
    requestSysInfo,
    getSysInfo,
    setSpecialMode,
    setBlueGreenMode,
    setRedFlashMode,
    setDFUMode,
    setGreenLight,
    setBlueLight,
    setColor,
  } = useAirSpecInterface();

  const [sysRun, setSysRun] = useState(true);

  const [dropdown, setDropdown] = useState(null);
  const openDropdown = ({ currentTarget }) => setDropdown(currentTarget);
  const closeDropdown = () => setDropdown(null);

  const [faceTemperatureEn, setFaceTemperatureEn] = useState(null);
  const [blinkEn, setBlinkEn] = useState(null);
  const [gasEn, setGasEn] = useState(null);
  const [lightLevelEn, setLightLevelEn] = useState(null);
  const [lightColorEn, setLightColorEn] = useState(null);
  const [humidityEn, setHumidityEn] = useState(null);
  const [micEn, setMicEn] = useState(null);

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

  var start_bit = 2;
  var blue_min_intensity = 10;
  var blue_max_intensity = 255;
  var green_max_intensity = 255;
  var step_size = 1;
  var step_duration = 100;

  return (
    // <MKBox component="section" py={12}>

    <Container>
      <Grid
        container
        xs={12}
        xm={12}
        lg={12}
        sx={{ textAlign: "left", my: 1, mx: "auto", px: 0.75 }}
      />
      {isConnected ? (
        // {true ? (
        // <Grid container justifyContent="left">
        // <Grid
        // container
        // item
        // xs={12}
        // lg={12}
        // flexDirection="column"
        // alignItems="left"
        // justifyContent="left"
        // sx={{ textAlign: "left", my: 6, mx: "auto", px: 0.75 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} xm={3} lg={3}>
            <Stack direction="column" alignItems="left" spacing={1}>
              <MKInput
                type="text"
                label="System ID"
                value="N/A"
                disabled="true"
              />
              <MKInput
                type="search"
                label="Firmware Version"
                value="N/A"
                disabled="true"
              />

              <MKTypography
                // variant="button"
                color="dark"
                fontWeight="regular"
                ml={1}
                sx={{ cursor: "pointer", userSelect: "none" }}
                onClick={toggleSwitch}
              >
                Sensor Activation
              </MKTypography>

              {/* <Grid container item xs={4} justifyContent="center" mx="auto"> */}
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={faceTemperatureEn}
                  disabled={!sysRun}
                  onChange={() => setFaceTemperatureEn(!faceTemperatureEn)}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  disabled={!sysRun}
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setFaceTemperatureEn(!faceTemperatureEn)}
                >
                  Face Temperature
                </MKTypography>
              </MKBox>
              {/* <Divider>CENTER</Divider> */}
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={blinkEn}
                  disabled={!sysRun}
                  onChange={() => setBlinkEn(!blinkEn)}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={!sysRun}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setBlinkEn(!blinkEn)}
                >
                  Blink Sensor
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={gasEn}
                  disabled={!sysRun}
                  onChange={() => setGasEn(!gasEn)}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={!sysRun}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setGasEn(!gasEn)}
                >
                  Gas Sensing
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={lightLevelEn}
                  disabled={!sysRun}
                  onChange={() => setLightLevelEn(!lightLevelEn)}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={!sysRun}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setLightLevelEn(!lightLevelEn)}
                >
                  Light Level Sensing
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={lightColorEn}
                  disabled={!sysRun}
                  onChange={() => setLightColorEn(!lightColorEn)}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={!sysRun}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setLightColorEn(!lightColorEn)}
                >
                  Light Color Sensing
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={humidityEn}
                  disabled={!sysRun}
                  onChange={() => setHumidityEn(!humidityEn)}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={!sysRun}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setHumidityEn(!humidityEn)}
                >
                  Humidity
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={micEn}
                  disabled={!sysRun}
                  onChange={() => setMicEn(!micEn)}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={!sysRun}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setMicEn(!micEn)}
                >
                  Microphone
                </MKTypography>
              </MKBox>
              {/* </Grid> */}

              {sysRun ? (
                <MKButton
                  variant="gradient"
                  color="success"
                  onClick={(event) => setSysRun(!sysRun)}
                >
                  Start System
                </MKButton>
              ) : (
                <MKButton
                  variant="gradient"
                  color="warning"
                  onClick={(event) => setSysRun(!sysRun)}
                >
                  Stop System
                </MKButton>
              )}
              <MKButton variant="gradient" color="success" onClick={requestSysInfo}>
                Start Streaming to Server
              </MKButton>
            </Stack>
          </Grid>
          <Grid item xs={12} xm={9} lg={9} spacing={2}>
            {/* <AirSpecControl connect isConnected setBlueGreenMode/> */}
            <AirSpecControl
              connect={connect}
              isConnected={isConnected}
              setBlueGreenMode={setBlueGreenMode}
              setRedFlashMode={setRedFlashMode}
              setDFUMode={setDFUMode}
            />
          </Grid>
        </Grid>
      ) : (
        <Grid container justifyContent="center">
          <Stack direction="row" alignItems="flex-end" spacing={1}>
            <MKButton onClick={connect} variant="gradient" color="dark">
              Connect
            </MKButton>
          </Stack>
        </Grid>
      )}
    </Container>
    // </MKBox>
  );
}

export default ButtonsBluetooth;
