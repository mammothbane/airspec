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
import MKAlert from "components/MKAlert";

// import { useAirSpecInterface } from "hooks/useAirSpecInterface";

// import { useAirSpecInterface } from "hooks/useAirSpecInterface";

function AirSpecControl(props) {
  // function AirSpecControl = ({ connect }, isConnected, {setBlueGreenMode}) => {
    const [updateViz, setUpdateViz] = useState(null);

  const [dropdown, setDropdown] = useState(null);
  const [specialFuncDropDown, setSpecialFuncDropDown] = useState(null);
  const [specialFuncDropDownAct, setSpecialFuncDropDownAct] = useState(null);

  const [sensorConfigDropDown, setSensorConfigDropDown] = useState(null);
  const [sensorConfigDropDownAct, setSensorConfigDropDownAct] = useState(null);

  const [thermopileConfigFuncDropDownAct, setThermopileConfigFuncDropDownAct] = useState(null);
  const [inertialConfigFuncDropDownAct, setInertialConfigFuncDropDownAct] = useState(null);
  const [blinkConfigFuncDropDownAct, setBlinkConfigFuncDropDownAct] = useState(null);
  const [gasConfigFuncDropDownAct, setGasConfigFuncDropDownAct] = useState(null);
  const [lightLevelConfigFuncDropDownAct, setLightLevelConfigFuncDropDownAct] = useState(null);
  const [lightColorConfigFuncDropDownAct, setLightColorConfigFuncDropDownAct] = useState(null);
  const [humidityConfigFuncDropDownAct, setHumidityConfigFuncDropDownAct] = useState(null);
  const [micConfigFuncDropDownAct, setMicConfigFuncDropDownAct] = useState(null);

  const [updateSysAlert, setUpdateSysAlert] = useState(false);

  const [specialBlueGreenFuncDropDownAct, setSpecialBlueGreenFuncDropDownAct] =
    useState(null);
  const [specialDFUFuncDropDownAct, setSpecialDFUFuncDropDownAct] =
    useState(null);
  const [specialRedFlashFuncDropDownAct, setSpecialRedFlashFuncDropDownAct] =
    useState(null);

    

    // const [specialRedFlashFuncDropDownAct, setSpecialRedFlashFuncDropDownAct] =
    // useState(null);
    // const [specialRedFlashFuncDropDownAct, setSpecialRedFlashFuncDropDownAct] =
    // useState(null);

  const openDropdown = ({ currentTarget }) => setDropdown(currentTarget);

  const openSpecialFuncDropDown = ({ currentTarget }) =>
    setSpecialFuncDropDown(currentTarget);

  const openSensorConfigDropDown = ({ currentTarget }) =>
    setSensorConfigDropDown(currentTarget);

    
  const [sensorConfigSubMenuDropDown_1, setSensorConfigSubMenuDropDown_1] = useState(null);
  const [sensorConfigSubMenuDropDownAct_1, setSensorConfigSubMenuDropDownAct_1] = useState(null);
  const openSensorConfigSubMenuDropDown_1 = ({ currentTarget }) =>
    setSensorConfigSubMenuDropDown_1(currentTarget);
  const closeSensorConfigSubMenuDropDown_1 = () => setSensorConfigSubMenuDropDown_1(null);

  const [sensorConfigSubMenuDropDown_2, setSensorConfigSubMenuDropDown_2] = useState(null);
  const [sensorConfigSubMenuDropDownAct_2, setSensorConfigSubMenuDropDownAct_2] = useState(null);
  const openSensorConfigSubMenuDropDown_2 = ({ currentTarget }) =>
    setSensorConfigSubMenuDropDown_2(currentTarget);
  const closeSensorConfigSubMenuDropDown_2 = () => setSensorConfigSubMenuDropDown_2(null);


  const closeSensorConfigDropDown = ({ currentTarget }) => {
      // setSpecialDFUFuncDropDownAct(false);
      // setSpecialRedFlashFuncDropDownAct(false);
      // setSpecialBlueGreenFuncDropDownAct(false);
      setSensorConfigDropDown(null);
    };
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
  const sensorThermopileConfigurationDropdownAct = () => {
    setThermopileConfigFuncDropDownAct(true);
    setInertialConfigFuncDropDownAct(false);
    setBlinkConfigFuncDropDownAct(false);
    setGasConfigFuncDropDownAct(false);
    setLightLevelConfigFuncDropDownAct(false);
    setLightColorConfigFuncDropDownAct(false);
    setHumidityConfigFuncDropDownAct(false);
    setMicConfigFuncDropDownAct(false);

    setSensorConfigDropDown(null);
  };
  const sensorInertialConfigurationDropdownAct = () => {
    setThermopileConfigFuncDropDownAct(false);
    setInertialConfigFuncDropDownAct(true);
    setBlinkConfigFuncDropDownAct(false);
    setGasConfigFuncDropDownAct(false);
    setLightLevelConfigFuncDropDownAct(false);
    setLightColorConfigFuncDropDownAct(false);
    setHumidityConfigFuncDropDownAct(false);
    setMicConfigFuncDropDownAct(false);

    setSensorConfigDropDown(null);
  };
  const sensorBlinkConfigurationDropdownAct = () => {
    setThermopileConfigFuncDropDownAct(false);
    setInertialConfigFuncDropDownAct(false);
    setBlinkConfigFuncDropDownAct(true);
    setGasConfigFuncDropDownAct(false);
    setLightLevelConfigFuncDropDownAct(false);
    setLightColorConfigFuncDropDownAct(false);
    setHumidityConfigFuncDropDownAct(false);
    setMicConfigFuncDropDownAct(false);

    setSensorConfigDropDown(null);
  };
  const sensorGasConfigurationDropdownAct = () => {
    setThermopileConfigFuncDropDownAct(false);
    setInertialConfigFuncDropDownAct(false);
    setBlinkConfigFuncDropDownAct(false);
    setGasConfigFuncDropDownAct(true);
    setLightLevelConfigFuncDropDownAct(false);
    setLightColorConfigFuncDropDownAct(false);
    setHumidityConfigFuncDropDownAct(false);
    setMicConfigFuncDropDownAct(false);

    setSensorConfigDropDown(null);
  };
  const sensorLightLevelConfigurationDropdownAct = () => {
    setThermopileConfigFuncDropDownAct(false);
    setInertialConfigFuncDropDownAct(false);
    setBlinkConfigFuncDropDownAct(false);
    setGasConfigFuncDropDownAct(false);
    setLightLevelConfigFuncDropDownAct(true);
    setLightColorConfigFuncDropDownAct(false);
    setHumidityConfigFuncDropDownAct(false);
    setMicConfigFuncDropDownAct(false);

    setSensorConfigDropDown(null);
  };
  const sensorLightIntensityConfigurationDropdownAct = () => {
    setThermopileConfigFuncDropDownAct(false);
    setInertialConfigFuncDropDownAct(false);
    setBlinkConfigFuncDropDownAct(false);
    setGasConfigFuncDropDownAct(false);
    setLightLevelConfigFuncDropDownAct(false);
    setLightColorConfigFuncDropDownAct(true);
    setHumidityConfigFuncDropDownAct(false);
    setMicConfigFuncDropDownAct(false);

    setSensorConfigDropDown(null);
  };
  const sensorHumidityConfigurationDropdownAct = () => {
    setThermopileConfigFuncDropDownAct(false);
    setInertialConfigFuncDropDownAct(false);
    setBlinkConfigFuncDropDownAct(false);
    setGasConfigFuncDropDownAct(false);
    setLightLevelConfigFuncDropDownAct(false);
    setLightColorConfigFuncDropDownAct(false);
    setHumidityConfigFuncDropDownAct(true);
    setMicConfigFuncDropDownAct(false);

    setSensorConfigDropDown(null);
  };
  const sensorMicConfigurationDropdownAct = () => {
    setThermopileConfigFuncDropDownAct(false);
    setInertialConfigFuncDropDownAct(false);
    setBlinkConfigFuncDropDownAct(false);
    setGasConfigFuncDropDownAct(false);
    setLightLevelConfigFuncDropDownAct(false);
    setLightColorConfigFuncDropDownAct(false);
    setHumidityConfigFuncDropDownAct(false);
    setMicConfigFuncDropDownAct(true);

    setSensorConfigDropDown(null);
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

  // const updateThermopileProp = (value) => {
  //   // console.log(val);
  //   props.sysInfo.thermopileSensorPeriod=value;
  //   setUpdateViz(!updateViz);
  //   console.log(props.sysInfo?.thermopileSensorPeriod);
  // }

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

  function GetLightIntensityIntegrationTime(val){
    if(val == 0xFF){
      return "2.73";
    } 
    else if (val == 0xF6){
      return "27.3";
    }
    else if (val == 0xDB){
      return "101";
    }
    else if (val == 0xC0){
      return "175";
    }
    else if (val == 0x00){
      return "600";
    }else{
      return "invalid"
    }
  }

  function GetLightIntensityGain(val){
    if(val == 0x00){
      return "1x";
    } 
    else if (val == 0x01){
      return "8x";
    }
    else if (val == 0x02){
      return "16x";
    }
    else if (val == 0x03){
      return "120x";
    }else{
      return "invalid"
    }
  }

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
                  onClose={closeSensorConfigDropDown}
                >
                  <MenuItem onClick={sensorThermopileConfigurationDropdownAct}>
                    Face Temperature
                  </MenuItem>
                  <MenuItem onClick={sensorInertialConfigurationDropdownAct}>Inertial System</MenuItem>

                  <MenuItem onClick={sensorBlinkConfigurationDropdownAct}>Blink Sensing</MenuItem>
                  <MenuItem onClick={sensorGasConfigurationDropdownAct}>Gas Sensing</MenuItem>
                  <MenuItem onClick={sensorLightLevelConfigurationDropdownAct}>
                    Light Level Sensor
                  </MenuItem>
                  <MenuItem onClick={sensorLightIntensityConfigurationDropdownAct}>
                    Light Color Sensor
                  </MenuItem>
                  <MenuItem onClick={sensorHumidityConfigurationDropdownAct}>
                    Humidity
                  </MenuItem>
                  <MenuItem onClick={sensorMicConfigurationDropdownAct}>
                    Microphone
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
            
            {sensorConfigDropDownAct ? (
                <Stack direction="column">

<MKTypography
                  variant="subtitle2"
                  color="info"
                  fontWeight="light"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                    Make sure to click "Send Configuration" to send new settings to AirSpecs
                 </MKTypography>
     
            {thermopileConfigFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>

                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  // onClick={toggleRedFlashModeSwitch}
                >
                  Thermopile Settings
                </MKTypography>
                {/* <MKBox display="flex" alignItems="center">
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
                </MKBox> */}
                <MKInput
                  type="number"
                  label="Sample Period (ms)"
                  fullWidth
                  value={props.sysInfo.thermopileSensorPeriod}
                  onChange={(event) => {
                    props.sysInfo.thermopileSensorPeriod=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />
                <MKButton
                  onClick={() => props.updateSysInfo()}
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton>
              </Stack>
            ) : null }


          {inertialConfigFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>

                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Inertial Settings
                </MKTypography>
                
                <MKInput
                  type="number"
                  label="Sample Rate (Hz)"
                  fullWidth
                  value={props.sysInfo.inertialSampleRate}
                  onChange={(event) => {
                    props.sysInfo.inertialSampleRate=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 

                  // props.sysInfo.inertialGyroLPFEn;,
                  // props.sysInfo.inertialGyroRange;
                  // props.sysInfo.inertialGyroRate;
                  // props.sysInfo.inertialAccLPFEn;
                  // props.sysInfo.inertialAccRange;
                  // props.sysInfo.inertialAccRate;
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />
                <MKButton
                  onClick={() => props.updateSysInfo()}
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton>
              </Stack>
            ) : null }

{blinkConfigFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>

                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Blink Settings
                </MKTypography>
                
                <MKInput
                  type="number"
                  label="Sample Rate (Hz)"
                  fullWidth
                  value={props.sysInfo.blinkSampleRate}
                  onChange={(event) => {
                    props.sysInfo.thermopileSensorPeriod=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 

                  // props.sysInfo.blinkDaylightCompensatationEN;
                  // props.sysInfo.blinkDaylightLowerThresh;
                  // props.sysInfo.blinkDaylightUpperThresh;
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />
                <MKButton
                  onClick={() => props.updateSysInfo()}
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton>
              </Stack>
            ) : null }

{gasConfigFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>

                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Gas Settings
                </MKTypography>
                
                <MKInput
                  type="number"
                  label="Sample Period (ms)"
                  fullWidth
                  value={props.sysInfo.gasSamplePeriod}
                  onChange={(event) => {
                    props.sysInfo.gasSamplePeriod=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />
                <MKButton
                  onClick={() => props.updateSysInfo()}
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton>
              </Stack>
            ) : null }

{lightLevelConfigFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>

                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Light Level Settings
                </MKTypography>
                
                <MKInput
                  type="number"
                  label="Sample Period (ms)"
                  fullWidth
                  value={props.sysInfo.luxSamplePeriod}
                  onChange={(event) => {
                    props.sysInfo.luxSamplePeriod=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 

                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />

<Stack direction="row" alignItems="left" spacing={1}>
<Grid item xs={6} xm={6} lg={6}>
<Stack direction="column" alignItems="flex-end" spacing={1}>

<MKTypography
                  // variant="button"
                  color="inherit"
                  // fontWeight="light"
                  align="center"
                  variant="button"
                  verticalAlign="middle"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Gain
                </MKTypography>
                </Stack>
</Grid>

<Grid item xs={6} xm={6} lg={6}>
<Stack direction="column" alignItems="left" spacing={1}>
                <MKButton
                  variant="gradient"
                  color="secondary"
                  onClick={openSensorConfigSubMenuDropDown_2}
                >
                  {GetLightIntensityGain(props.sysInfo.luxGain)}{" "}
                  {}{" "}
                  <Icon sx={dropdownIconStyles}>expand_more</Icon>
                </MKButton>

                <Menu
                  anchorEl={sensorConfigSubMenuDropDown_2}
                  open={Boolean(sensorConfigSubMenuDropDown_2)}
                  onClose={closeSensorConfigSubMenuDropDown_2}
                >
                  <MenuItem onClick={(event) => {
                      props.sysInfo.luxGain=0x00;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 1x </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.luxGain=0x01;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 8x </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.luxGain=0x02;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 16x </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.luxGain=0x03;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 120x </MenuItem>
                </Menu>
                </Stack>
                </Grid>
                
                </Stack>

<Stack direction="row" alignItems="left" spacing={1}>
<Grid item xs={6} xm={6} lg={6}>
<Stack direction="column" alignItems="flex-end" spacing={1}>

<MKTypography
                  // variant="button"
                  color="inherit"
                  // fontWeight="light"
                  align="center"
                  variant="button"
                  verticalAlign="middle"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Integration Time (ms)
                </MKTypography>
                </Stack>
</Grid>

<Grid item xs={6} xm={6} lg={6}>
<Stack direction="column" alignItems="left" spacing={1}>
                <MKButton
                  variant="gradient"
                  color="secondary"
                  onClick={openSensorConfigSubMenuDropDown_1}
                >
                  {GetLightIntensityIntegrationTime(props.sysInfo.luxIntegrationTime)}{" "}
                  {}{" "}
                  <Icon sx={dropdownIconStyles}>expand_more</Icon>
                </MKButton>

                <Menu
                  anchorEl={sensorConfigSubMenuDropDown_1}
                  open={Boolean(sensorConfigSubMenuDropDown_1)}
                  onClose={closeSensorConfigSubMenuDropDown_1}
                >
                  <MenuItem onClick={(event) => {
                      props.sysInfo.luxIntegrationTime=0xFF;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 2.73 </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.luxIntegrationTime=0xF6;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 27.3 </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.luxIntegrationTime=0xDB;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 101 </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.luxIntegrationTime=0xC0;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 175 </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.luxIntegrationTime=0x00;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 600 </MenuItem>
                </Menu>
                </Stack>
                </Grid>
                
                </Stack>

                <MKButton
                  onClick={() => {
                    props.updateSysInfo();
                    setUpdateSysAlert(true);
                    setTimeout(function() { setUpdateSysAlert(false);}, 3000);
                  }}
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton>
                {updateSysAlert ? (
                <MKAlert>
                  <Icon fontSize="small">thumb_up</Icon>&nbsp;
                  Update sent to system!
                </MKAlert>
                ):(null)}
              </Stack>
            ) : null }

{lightColorConfigFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>

                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Light Color Settings
                </MKTypography>
                
                <MKInput
                  type="number"
                  label="Sample Period (ms)"
                  fullWidth
                  value={props.sysInfo.colorSamplePeriod}
                  onChange={(event) => {
                    props.sysInfo.colorSamplePeriod=event.target.value;
                    setUpdateViz(!updateViz);
            
                  }} 

                  // props.sysInfo.colorIntegrationTime;
                  // props.sysInfo.colorIntegrationStep;
                  // props.sysInfo.colorGain;
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />
                <MKButton
                  onClick={() => props.updateSysInfo()}
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton>
              </Stack>
            ) : null }

{humidityConfigFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>

                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Humidity Settings
                </MKTypography>
                
                <MKInput
                  type="number"
                  label="Sample Period (ms)"
                  fullWidth
                  value={props.sysInfo.humiditySamplePeriod}
                  onChange={(event) => {
                    props.sysInfo.humiditySamplePeriod=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 

                  // props.sysInfo.humidityPrecision;
                  // props.sysInfo.humidityHeaterSetting;
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />
                <MKButton
                  onClick={() => props.updateSysInfo()}
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton>
              </Stack>
            ) : null }

{micConfigFuncDropDownAct ? (
              <Stack direction="column" alignItems="left" spacing={2}>

                <MKTypography
                  // variant="button"
                  color="dark"
                  fontWeight="regular"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  Microphone Settings
                </MKTypography>
                
                <MKInput
                  type="number"
                  label="Sample Period (ms)"
                  fullWidth
                  value={props.sysInfo.micSampleRate}
                  onChange={(event) => {
                    props.sysInfo.micSampleRate=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />
                <MKButton
                  onClick={() => {
                    // console.log(props.sysInfo);
                    props.updateSysInfo();
                  }}
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton>
              </Stack>
            ) : null }

            </Stack>
            ) : null
            }
            {specialFuncDropDownAct ? (
              <Stack>
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
