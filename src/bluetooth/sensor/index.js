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

  const [sensorConfigSubMenuDropDown_3, setSensorConfigSubMenuDropDown_3] = useState(null);
  const [sensorConfigSubMenuDropDownAct_3, setSensorConfigSubMenuDropDownAct_3] = useState(null);
  const openSensorConfigSubMenuDropDown_3= ({ currentTarget }) =>
    setSensorConfigSubMenuDropDown_3(currentTarget);
  const closeSensorConfigSubMenuDropDown_3 = () => setSensorConfigSubMenuDropDown_3(null);

  const [sensorConfigSubMenuDropDown_4, setSensorConfigSubMenuDropDown_4] = useState(null);
  const [sensorConfigSubMenuDropDownAct_4, setSensorConfigSubMenuDropDownAct_4] = useState(null);
  const openSensorConfigSubMenuDropDown_4 = ({ currentTarget }) =>
    setSensorConfigSubMenuDropDown_4(currentTarget);
  const closeSensorConfigSubMenuDropDown_4 = () => setSensorConfigSubMenuDropDown_4(null);


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


  function GetInertialGyroRange(val){
    if(val == 0){
      return "+/- 250 dps";
    } 
    else if (val == 1){
      return "+/- 500 dps";
    }
    else if (val == 2){
      return "+/- 1000 dps";
    }
    else if (val == 3){
      return "+/- 2000 dps";
    }else{
      return "invalid"
    }
  }
  function GetInertialGyroLPFCutoff(enable, cutoff){
    if(enable == 0){
      return "disabled";
    }

    if(cutoff == 0){
      return "196.6 Hz";
    } 
    else if (cutoff == 1){
      return "151.8 Hz";
    }
    else if (cutoff == 2){
      return "119.5 Hz";
    }
    else if (cutoff == 3){
      return "51.2 Hz";
    }
    else if (cutoff == 4){
      return "23.9 Hz";
    }
    else if (cutoff == 5){
      return "11.6 Hz";
    }
    else if (cutoff == 6){
      return "5.7 Hz";
    }
    else if (cutoff == 7){
      return "351.4 Hz";
    }else{
      return "invalid"
    }
  }

  function GetInertialAccRange(val){
    
    if(val == 0){
      return "+/- 2g";
    } 
    else if (val == 1){
      return "+/- 4g";
    }
    else if (val == 2){
      return "+/- 8g";
    }
    else if (val == 3){
      return "+/- 16g";
    }else{
      return "invalid"
    }
  }
  function GetInertialAccLPFCutoff(enable, cutoff){
    if(enable == 0){
      return "disabled";
    }
    
    if(cutoff == 0){
      return "246.0 Hz";
    } 
    else if (cutoff == 1){
      return "111.4 Hz";
    }
    else if (cutoff == 2){
      return "50.4 Hz";
    }
    else if (cutoff == 3){
      return "23.9 Hz";
    }
    else if (cutoff == 4){
      return "11.5 Hz";
    }
    else if (cutoff == 5){
      return "5.7 Hz";
    }
    else if (cutoff == 6){
      return "473 Hz";
    }
    else{
      return "invalid"
    }
  }

  function GetMicSampleRate(val){
    
    if(val == 8000){
      return "8 kHz";
    } 
    else if (val == 11025){
      return "11.025 kHz";
    }
    else if (val == 16000){
      return "16 kHz";
    }
    else if (val == 22050){
      return "22.05 kHz";
    }
    else if (val == 32000){
      return "32 kHz";
    }
    else if (val == 44100){
      return "44.1 kHz";
    }
    else if (val == 48000){
      return "48 kHz";
    }
    else{
      return "invalid"
    }
  }

  function GetLightColorGain(val){
    if(val == 0x00){
      return "0.5x";
    } 
    else if (val == 1){
      return "1x";
    }
    else if (val == 2){
      return "2x";
    }
    else if (val == 3){
      return "4x";
    }else if (val == 4){
      return "8x";
    }else if (val == 5){
      return "16x";
    }else if (val == 6){
      return "32x";
    }else if (val == 7){
      return "64x";
    }else if (val == 8){
      return "128x";
    }else if (val == 9){
      return "256x";
    }else if (val == 10){
      return "512x";
    }else{
      return "invalid"
    }
  }

  function GetGyroSampleRate(val){
    let sampleRate = 1100.0/(1+val)
    return sampleRate.toString()
  }

  function GetAccelSampleRate(val){
    let sampleRate = 1125.0/(1+val)
    return sampleRate.toString()
  }

  function GetLightColorIntegrationTime(ATIME, ASTEP){
    let intTime = ((ATIME + 1) * (ASTEP + 1) * 2.78)/1000.0 // mS
    return intTime.toPrecision(2).toString()
  }

  function GetLightHumidityPrecision(val){
    if(val == 0x00){
      return "Low";
    } 
    else if (val == 1){
      return "Medium";
    }
    else if (val == 2){
      return "High";
    }
    else{
      return "invalid"
    }
  }

  function GetLightHumidityHeater(val){
    if(val == 0x00){
      return "No Heater";
    } 
    else if (val == 1){
      return "High Heater (1s)";
    }
    else if (val == 2){
      return "High Heater (100ms)";
    }
    else if (val == 3){
      return "Med Heater (1ms)";
    }
    else if (val == 4){
      return "Med Heater (100ms)";
    }
    else if (val == 5){
      return "Low Heater (1s)";
    }
    else if (val == 6){
      return "Low Heater (100ms)";
    }
    else{
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
                {/* <MKButton
                  onClick={() => {
                    props.updateSysInfo();
                    setUpdateSysAlert(true);
                    setTimeout(function() { setUpdateSysAlert(false);}, 3000);
                  }}
                  variant="gradient"
                  color="dark"
                >
                  Send Configuraton
                </MKButton> */}
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
                  Gyro Low-Pass Filter
                </MKTypography>
                </Stack>
</Grid>

<Grid item xs={6} xm={6} lg={6}>
<Stack direction="column" alignItems="left" spacing={1}>
                <MKButton
                  variant="gradient"
                  // color="secondary"
                  onClick={openSensorConfigSubMenuDropDown_1}
                >
                  {GetInertialGyroLPFCutoff(props.sysInfo.inertialGyroLPFEn,props.sysInfo.inertialGyroLPFCutoff)}{" "}
                  {}{" "}
                  <Icon sx={dropdownIconStyles}>expand_more</Icon>
                </MKButton>

                <Menu
                  anchorEl={sensorConfigSubMenuDropDown_1}
                  open={Boolean(sensorConfigSubMenuDropDown_1)}
                  onClose={closeSensorConfigSubMenuDropDown_1}
                >
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroLPFEn=0;
                      props.sysInfo.inertialGyroLPFCutoff=0;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> Disabled </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroLPFEn=1;
                      props.sysInfo.inertialGyroLPFCutoff=0;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 196.6 Hz </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroLPFEn=1;
                      props.sysInfo.inertialGyroLPFCutoff=1;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 151.8 Hz </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroLPFEn=1;
                      props.sysInfo.inertialGyroLPFCutoff=2;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 119.5 Hz </MenuItem>
                   <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroLPFEn=1;
                      props.sysInfo.inertialGyroLPFCutoff=3;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 51.2 Hz </MenuItem>
                   <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroLPFEn=1;
                      props.sysInfo.inertialGyroLPFCutoff=4;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 23.9 Hz </MenuItem>
                   <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroLPFEn=1;
                      props.sysInfo.inertialGyroLPFCutoff=5;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 11.6 Hz </MenuItem>
                   <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroLPFEn=1;
                      props.sysInfo.inertialGyroLPFCutoff=6;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 5.7 Hz </MenuItem>
                   <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroLPFEn=1;
                      props.sysInfo.inertialGyroLPFCutoff=7;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 351.4 Hz </MenuItem>
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
                  Gyro Range
                </MKTypography>
                </Stack>
</Grid>

<Grid item xs={6} xm={6} lg={6}>
<Stack direction="column" alignItems="left" spacing={1}>
                <MKButton
                  variant="gradient"
                  // color="secondary"
                  onClick={openSensorConfigSubMenuDropDown_2}
                >
                  {GetInertialGyroRange(props.sysInfo.inertialGyroRange)}{" "}
                  {}{" "}
                  <Icon sx={dropdownIconStyles}>expand_more</Icon>
                </MKButton>

                <Menu
                  anchorEl={sensorConfigSubMenuDropDown_2}
                  open={Boolean(sensorConfigSubMenuDropDown_2)}
                  onClose={closeSensorConfigSubMenuDropDown_2}
                >
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroRange=0;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> +/- 250 DPS </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroRange=1;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> +/- 500 DPS </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroRange=2;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> +/- 1000 DPS </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialGyroRange=3;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> +/- 2000 DPS </MenuItem>
                </Menu>
                </Stack>
                </Grid>
                
                </Stack>

                <MKInput
                  type="number"
                  label="Gyro Sample Rate Divisor (max: 255)"
                  fullWidth
                  value={props.sysInfo.inertialGyroRate}
                  onChange={(event) => {
                    props.sysInfo.inertialGyroRate=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 
                  
                  InputProps={{
                    inputProps: { min: 0 , max:255},
                  }}
                  />

                <MKTypography
                  color="inherit"
                  align="center"
                  variant="button"
                  verticalAlign="middle"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                 Gyro sample rate: {" "} {GetGyroSampleRate(props.sysInfo.inertialGyroRate)} {" Hz"}

                </MKTypography>

                <hr/>

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
                  Accelerometer Low-Pass Filter
                </MKTypography>
                </Stack>
</Grid>

<Grid item xs={6} xm={6} lg={6}>
<Stack direction="column" alignItems="left" spacing={1}>
                <MKButton
                  variant="gradient"
                  // color="secondary"
                  onClick={openSensorConfigSubMenuDropDown_3}
                >
                  {GetInertialAccLPFCutoff(props.sysInfo.inertialAccLPFEn,props.sysInfo.inertialAccLPFCutoff)}{" "}
                  {}{" "}
                  <Icon sx={dropdownIconStyles}>expand_more</Icon>
                </MKButton>

                <Menu
                  anchorEl={sensorConfigSubMenuDropDown_3}
                  open={Boolean(sensorConfigSubMenuDropDown_3)}
                  onClose={closeSensorConfigSubMenuDropDown_3}
                >
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccLPFEn=0;
                      props.sysInfo.inertialAccLPFCutoff=0;
                      closeSensorConfigSubMenuDropDown_3();
                  }}> Disabled </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccLPFEn=1;
                      props.sysInfo.inertialAccLPFCutoff=0;
                      closeSensorConfigSubMenuDropDown_3();
                  }}> 246.0 Hz </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccLPFEn=1;
                      props.sysInfo.inertialAccLPFCutoff=1;
                      closeSensorConfigSubMenuDropDown_3();
                  }}> 111.4 Hz </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccLPFEn=1;
                      props.sysInfo.inertialAccLPFCutoff=2;
                      closeSensorConfigSubMenuDropDown_3();
                  }}> 50.4 Hz </MenuItem>
                   <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccLPFEn=1;
                      props.sysInfo.inertialAccLPFCutoff=3;
                      closeSensorConfigSubMenuDropDown_3();
                  }}> 23.9 Hz </MenuItem>
                   <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccLPFEn=1;
                      props.sysInfo.inertialAccLPFCutoff=4;
                      closeSensorConfigSubMenuDropDown_3();
                  }}> 11.5 Hz </MenuItem>
                   <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccLPFEn=1;
                      props.sysInfo.inertialAccLPFCutoff=5;
                      closeSensorConfigSubMenuDropDown_3();
                  }}> 5.7 Hz </MenuItem>
                   <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccLPFEn=1;
                      props.sysInfo.inertialAccLPFCutoff=6;
                      closeSensorConfigSubMenuDropDown_3();
                  }}> 473 Hz </MenuItem>
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
                  Accelerometer Range
                </MKTypography>
                </Stack>
</Grid>

<Grid item xs={6} xm={6} lg={6}>
<Stack direction="column" alignItems="left" spacing={1}>
                <MKButton
                  variant="gradient"
                  // color="secondary"
                  onClick={openSensorConfigSubMenuDropDown_4}
                >
                  {GetInertialAccRange(props.sysInfo.inertialAccRange)}{" "}
                  {}{" "}
                  <Icon sx={dropdownIconStyles}>expand_more</Icon>
                </MKButton>

                <Menu
                  anchorEl={sensorConfigSubMenuDropDown_4}
                  open={Boolean(sensorConfigSubMenuDropDown_4)}
                  onClose={closeSensorConfigSubMenuDropDown_4}
                >
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccRange=0;
                      closeSensorConfigSubMenuDropDown_4();
                  }}> +/- 2g </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccRange=1;
                      closeSensorConfigSubMenuDropDown_4();
                  }}> +/- 4g </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccRange=2;
                      closeSensorConfigSubMenuDropDown_4();
                  }}> +/- 8g </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.inertialAccRange=3;
                      closeSensorConfigSubMenuDropDown_4();
                  }}> +/- 16g</MenuItem>
                </Menu>
                </Stack>
                </Grid>
                
                </Stack>

                  <MKInput
                  type="number"
                  label="Accelerometer Sample Rate Divisor (max: 4095)"
                  fullWidth
                  value={props.sysInfo.inertialAccRate}
                  onChange={(event) => {
                    props.sysInfo.inertialAccRate=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 
                  
                  InputProps={{
                    inputProps: { min: 0 , max:4095},
                  }}
                  />

                <MKTypography
                  color="inherit"
                  align="center"
                  variant="button"
                  verticalAlign="middle"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                 Accelerometer sample rate: {" "} {GetAccelSampleRate(props.sysInfo.inertialAccRate)} {" Hz"}

                </MKTypography>

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
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />

              <MKBox display="flex" alignItems="center">
                <Switch
                  checked={props.sysInfo.blinkDaylightCompensatationEN}
                  // disabled={Boolean(props.sysInfo.blinkDaylightCompensatationEN)}
                  onChange={() => {
                    props.sysInfo.blinkDaylightCompensatationEN = !props.sysInfo.blinkDaylightCompensatationEN;
                    setUpdateViz(!updateViz);
                  }}
                />
                <MKTypography
                  variant="button"
                  color="text"
                  fontWeight="regular"
                  // disabled={!Boolean(props.sysInfo.blinkDaylightCompensatationEN)}
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => {
                    props.sysInfo.blinkDaylightCompensatationEN = !props.sysInfo.blinkDaylightCompensatationEN;
                    setUpdateViz(!updateViz);
                  }}
                >
                  Daylight Compensation
                </MKTypography>
              </MKBox>
                  
                  <MKInput
                  type="number"
                  label="Daylight Compensation: Lower Threshold"
                  fullWidth
                  disabled={Boolean(!props.sysInfo.blinkDaylightCompensatationEN)}
                  value={props.sysInfo.blinkDaylightLowerThresh}
                  onChange={(event) => {
                    props.sysInfo.blinkDaylightLowerThresh=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 
                  
                  InputProps={{
                    inputProps: { min: 0 , max:props.sysInfo.blinkDaylightUpperThresh},
                  }}
                />

                <MKInput
                  type="number"
                  label="Daylight Compensation: Upper Threshold"
                  fullWidth
                  disabled={Boolean(!props.sysInfo.blinkDaylightCompensatationEN)}
                  value={props.sysInfo.blinkDaylightUpperThresh}
                  onChange={(event) => {
                    props.sysInfo.blinkDaylightUpperThresh=event.target.value;
                    setUpdateViz(!updateViz);
                  }}  
                  
                  InputProps={{
                    inputProps: { min: props.sysInfo.blinkDaylightLowerThresh , max:255},
                  }}
                />

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
                  // color="secondary"
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
                  // color="secondary"
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

                {/* <MKButton
                  onClick={() => {
                    props.updateSysInfo();
                    setUpdateSysAlert(true);
                    setTimeout(function() { setUpdateSysAlert(false);}, 3000);
                  }}
                  variant="gradient"
                  color="dark"
                >                    
                  Send Configuraton
                </MKButton> */}
                
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
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />

<MKInput
                  type="number"
                  label="Analog Integration Time Per Step (max: 255)"
                  fullWidth
                  value={props.sysInfo.colorIntegrationTime}
                  onChange={(event) => {
                    props.sysInfo.colorIntegrationTime=event.target.value;
                    setUpdateViz(!updateViz);
            
                  }} 
                  
                  InputProps={{
                    inputProps: { min: 0 , max:255},
                  }}
                />

<MKInput
                  type="number"
                  label="Analog Integration Step (max: 65534)"
                  fullWidth
                  value={props.sysInfo.colorIntegrationStep}
                  onChange={(event) => {
                    props.sysInfo.colorIntegrationStep=event.target.value;
                    setUpdateViz(!updateViz);
            
                  }} 
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65534},
                  }}
                />

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
                 Total Integration Time: {" "} {GetLightColorIntegrationTime(props.sysInfo.colorIntegrationTime,props.sysInfo.colorIntegrationStep)} {" ms"}

                </MKTypography>

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
                  // color="secondary"
                  onClick={openSensorConfigSubMenuDropDown_2}
                >
                  {GetLightColorGain(props.sysInfo.colorGain)}{" "}
                  {}{" "}
                  <Icon sx={dropdownIconStyles}>expand_more</Icon>
                </MKButton>

                <Menu
                  anchorEl={sensorConfigSubMenuDropDown_2}
                  open={Boolean(sensorConfigSubMenuDropDown_2)}
                  onClose={closeSensorConfigSubMenuDropDown_2}
                >
                  <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=0;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 0.5x </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=1;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 1x </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=2;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 2x </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=3;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 4x </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=4;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 8x </MenuItem>
                                    <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=5;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 16x </MenuItem>
                                    <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=6;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 32x </MenuItem>
                                    <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=7;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 64x </MenuItem>
                                    <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=8;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 128x </MenuItem>
                                    <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=9;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 256x </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.colorGain=10;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> 512x </MenuItem>
                </Menu>
                </Stack>
                </Grid>
                
                </Stack>

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
                  Precision
                </MKTypography>
                </Stack>
</Grid>

<Grid item xs={6} xm={6} lg={6}>
<Stack direction="column" alignItems="left" spacing={1}>
                <MKButton
                  variant="gradient"
                  // color="secondary"
                  onClick={openSensorConfigSubMenuDropDown_1}
                >
                  {GetLightHumidityPrecision(props.sysInfo.humidityPrecision)}{" "}
                  {}{" "}
                  <Icon sx={dropdownIconStyles}>expand_more</Icon>
                </MKButton>

                <Menu
                  anchorEl={sensorConfigSubMenuDropDown_1}
                  open={Boolean(sensorConfigSubMenuDropDown_1)}
                  onClose={closeSensorConfigSubMenuDropDown_1}
                >
                  <MenuItem onClick={(event) => {
                      props.sysInfo.humidityPrecision=0;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> Low </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.humidityPrecision=1;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> Medium </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.humidityPrecision=2;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> High </MenuItem>
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
                  Heater Settings
                </MKTypography>
                </Stack>
</Grid>

<Grid item xs={6} xm={6} lg={6}>
<Stack direction="column" alignItems="left" spacing={1}>
                <MKButton
                  variant="gradient"
                  // color="secondary"
                  onClick={openSensorConfigSubMenuDropDown_2}
                >
                  {GetLightHumidityHeater(props.sysInfo.humidityHeaterSetting)}{" "}
                  {}{" "}
                  <Icon sx={dropdownIconStyles}>expand_more</Icon>
                </MKButton>

                <Menu
                  anchorEl={sensorConfigSubMenuDropDown_2}
                  open={Boolean(sensorConfigSubMenuDropDown_2)}
                  onClose={closeSensorConfigSubMenuDropDown_2}
                >
                  <MenuItem onClick={(event) => {
                      props.sysInfo.humidityHeaterSetting=0;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> No Heater </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.humidityHeaterSetting=1;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> High Heater (1s) </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.humidityHeaterSetting=2;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> High Heater (100ms) </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.humidityHeaterSetting=3;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> Med Heater (1s) </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.humidityHeaterSetting=4;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> Med Heater (100s) </MenuItem>
                                    <MenuItem onClick={(event) => {
                      props.sysInfo.humidityHeaterSetting=5;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> Low Heater (1s) </MenuItem>
                                    <MenuItem onClick={(event) => {
                      props.sysInfo.humidityHeaterSetting=6;
                      closeSensorConfigSubMenuDropDown_2();
                  }}> Low Heater (100s) </MenuItem>
                  
                </Menu>
                </Stack>
                </Grid>
                
                </Stack>

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
                
                {/* <MKInput
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
                /> */}

                <MKButton
                  variant="gradient"
                  // color="secondary"
                  onClick={openSensorConfigSubMenuDropDown_1}
                >
                  {GetMicSampleRate(props.sysInfo.micSampleRate)}{" "}
                  {}{" "}
                  <Icon sx={dropdownIconStyles}>Mic Sample Rate</Icon>
                </MKButton>

                <Menu
                  anchorEl={sensorConfigSubMenuDropDown_1}
                  open={Boolean(sensorConfigSubMenuDropDown_1)}
                  onClose={closeSensorConfigSubMenuDropDown_1}
                >

                  <MenuItem onClick={(event) => {
                      props.sysInfo.micSampleRate=8000;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 8 kHz </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.micSampleRate=11025;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 11.025 kHz </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.micSampleRate=16000;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 16 kHz </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.micSampleRate=22050;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 22.05 kHz </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.micSampleRate=32000;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 32 kHz </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.micSampleRate=44100;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 44.1 kHz </MenuItem>
                  <MenuItem onClick={(event) => {
                      props.sysInfo.micSampleRate=48000;
                      closeSensorConfigSubMenuDropDown_1();
                  }}> 48 kHz </MenuItem>
                </Menu>

                <MKInput
                  type="number"
                  label="FFT Sample Period (ms)"
                  fullWidth
                  value={props.sysInfo.fftSamplePeriod}
                  onChange={(event) => {
                    props.sysInfo.fftSamplePeriod=event.target.value;
                    setUpdateViz(!updateViz);
                  }} 
                  
                  InputProps={{
                    inputProps: { min: 0 , max:65000},
                  }}
                />

                
              </Stack>
            ) : null }
            <div style={{ padding: 2 }}>

<Grid container spacing={0}>
<Stack direction="column" spacing={2}>

              <hr/>
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
                ) : ( 
            <MKTypography
                  variant="subtitle2"
                  color="info"
                  fontWeight="light"
                  ml={1}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                    Make sure to click "Send Configuration" to send new settings to AirSpecs
                 </MKTypography>
            )}
                        </Stack>
            </Grid>
            </div>
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
