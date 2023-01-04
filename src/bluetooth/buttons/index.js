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
    setSysInfo,
    toggle,
    requestSysInfo,
    updateSysInfo,
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

  const [faceTemperatureEn, setFaceTemperatureEn] = useState(false);
  const [blinkEn, setBlinkEn] = useState(false);
  const [gasEn, setGasEn] = useState(false);
  const [lightLevelEn, setLightLevelEn] = useState(false);
  const [lightColorEn, setLightColorEn] = useState(false);
  const [humidityEn, setHumidityEn] = useState(false);
  const [micEn, setMicEn] = useState(false);
  const [inertialEn, setInertialEn] = useState(false);

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

  function changeThermopileState() {
    sysInfo.thermopileSensorEn = !sysInfo?.thermopileSensorEn;
    setSysInfo(sysInfo);
    setFaceTemperatureEn(!faceTemperatureEn);
    updateSysInfo();
  }

  function changeInertialState() {
    sysInfo.inertialSensorEn = !sysInfo?.inertialSensorEn;
    setSysInfo(sysInfo);
    setInertialEn(!inertialEn);
    updateSysInfo();
  }

  function changeMicState() {
    sysInfo.micSensorEn = !sysInfo?.micSensorEn;
    setSysInfo(sysInfo);
    setMicEn(!micEn);
    updateSysInfo();
  }

  function changeColorState() {
    sysInfo.colorSensorEn = !sysInfo?.colorSensorEn;
    setSysInfo(sysInfo);
    setLightColorEn(!lightColorEn);
    updateSysInfo();
  }

  function changeLuxState() {
    sysInfo.luxSensorEn = !sysInfo?.luxSensorEn;
    setSysInfo(sysInfo);
    setLightLevelEn(!lightLevelEn);
    updateSysInfo();
  }

  function changeGasState() {
    sysInfo.gasSensorEn = !sysInfo?.gasSensorEn;
    setSysInfo(sysInfo);
    setGasEn(!gasEn);
    updateSysInfo();
  }

  function changeHumidityState() {
    sysInfo.humiditySensorEn = !sysInfo?.humiditySensorEn;
    setSysInfo(sysInfo);
    setHumidityEn(!humidityEn);
    updateSysInfo();
  }

  function changeBlinkState() {
    sysInfo.blinkSensorEn = !sysInfo?.blinkSensorEn;
    setSysInfo(sysInfo);
    setBlinkEn(!blinkEn);
    updateSysInfo();
  }

 function connectToAirSpec(){
    connect();
  }

  function changeSystemState(){
    sysInfo.systemRunState = !sysInfo?.systemRunState;
    setSysInfo(sysInfo);
    setSysRun(!sysRun);
    console.log(sysInfo.systemRunState)
    updateSysInfo();
  }

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
      {/* {isConnected ? ( */}
      {true ? (
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
              
              { sysInfo? (
                <Stack direction="column" alignItems="left" spacing={1}>
                <MKInput
                type="text"
                label="System ID"
                value={sysInfo?.uuid.toString(16)}
                disabled="true"
              />
              <MKInput
                type="number"
                label="Firmware Version"
                value={sysInfo.firmware_version}
                disabled="true"
              />
              </Stack>
      ):(
        <Stack direction="column" alignItems="left" spacing={1}>
        <MKInput
                type="text"
                label="System ID"
                value="N/A"
                disabled="true"
              />
        <MKInput
                type="text"
                label="Firmware Version"
                value="N/A"
                disabled="true"
              />
              </Stack>
        )} 

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
                  checked={sysInfo?.thermopileSensorEn}
                  disabled={sysInfo?.systemRunState}
                  onChange={() => changeThermopileState()}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  disabled={sysInfo?.systemRunState}
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => changeThermopileState()}
                >
                  Face Temperature
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={sysInfo?.inertialSensorEn}
                  disabled={sysInfo?.systemRunState}
                  onChange={() => changeInertialState()}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  disabled={sysInfo?.systemRunState}
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => changeInertialState()}
                >
                  Inertial Measurements
                </MKTypography>
              </MKBox>
              {/* <Divider>CENTER</Divider> */}
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={sysInfo?.blinkSensorEn}
                  disabled={sysInfo?.systemRunState}
                  onChange={() => changeBlinkState()}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={sysInfo?.systemRunState}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => changeBlinkState()}
                >
                  Blink Sensor
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={sysInfo?.gasSensorEn}
                  disabled={sysInfo?.systemRunState}
                  onChange={() => changeGasState()}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={sysInfo?.systemRunState}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => changeGasState()}
                >
                  Gas Sensing
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={sysInfo?.luxSensorEn}
                  disabled={sysInfo?.systemRunState}
                  onChange={() => changeLuxState()}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={sysInfo?.systemRunState}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => changeLuxState()}
                >
                  Light Level Sensing
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={sysInfo?.colorSensorEn}
                  disabled={sysInfo?.systemRunState}
                  onChange={() => changeColorState()}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={!sysInfo?.systemRunState}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => changeColorState()}
                >
                  Light Color Sensing
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={sysInfo?.humiditySensorEn}
                  disabled={sysInfo?.systemRunState}
                  onChange={() => changeHumidityState()}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={sysInfo?.systemRunState}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => changeHumidityState()}
                >
                  Humidity
                </MKTypography>
              </MKBox>
              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={sysInfo?.micSensorEn}
                  disabled={sysInfo?.systemRunState}
                  onChange={() => changeMicState()}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  ml={1}
                  disabled={sysInfo?.systemRunState}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => changeMicState()}
                >
                  Microphone
                </MKTypography>
              </MKBox>
              {/* </Grid> */}

              {sysInfo?.systemRunState ? (
                <MKButton
                variant="gradient"
                color="warning"
                onClick={(event) => changeSystemState()}
              >
                Stop System
              </MKButton>
              ) : (
                <MKButton
                  variant="gradient"
                  color="success"
                  onClick={(event) => changeSystemState()}
                >
                  Start System
                </MKButton>
                
              )}
              <MKTypography
                  variant="subtitle2"
                  color="info"
                  fontWeight="light"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  When system is started, the system will continously stream data with the current configuration, even after a reboot or reconnection.
                </MKTypography>
              <MKButton variant="gradient" color="success" disabled="true">
                Start Streaming to Server (Not Implemented)
              </MKButton>
              <MKTypography
                  variant="subtitle2"
                  color="info"
                  fontWeight="light"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Activating server streaming will forward all received packages through this web browser to the InfluxDB database.
                </MKTypography>
            </Stack>
          </Grid>
          <Grid item xs={12} xm={9} lg={9} spacing={2}>
            {/* <AirSpecControl connect isConnected setBlueGreenMode/> */}
            <AirSpecControl
              connect={connectToAirSpec}
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
