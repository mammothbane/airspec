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
    toggle,
    isConnected,
    setRedLight,
    setBlueGreenMode,
    setGreenLight,
    setBlueLight,
    setColor,
  } = useAirSpecInterface();

  const [dropdown, setDropdown] = useState(null);
  const openDropdown = ({ currentTarget }) => setDropdown(currentTarget);
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

  var start_bit = 2;
  var blue_min_intensity = 10;
  var blue_max_intensity = 255;
  var green_max_intensity = 255;
  var step_size = 1;
  var step_duration = 100;

  return (
    // <MKBox component="section" py={12}>


      <Container>
          <Grid container xs={12} xm={12} lg={12} 
    sx={{ textAlign: "left", my: 1, mx: "auto", px: 0.75 }}/>
        {/* {isConnected ? ( */}
        {true ? (
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
            <Grid item xs={12} xm={3} lg={3} >
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
                  <Switch checked={checked} onChange={toggleSwitch} />
                  <MKTypography
                    variant="button"
                    color="text"
                    fontWeight="regular"
                    ml={1}
                    sx={{ cursor: "pointer", userSelect: "none" }}
                    onClick={toggleSwitch}
                  >
                    Face Temperature
                  </MKTypography>
                </MKBox>
                {/* <Divider>CENTER</Divider> */}
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
                    Blink Sensor
                  </MKTypography>
                </MKBox>
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
                    Gas Sensing
                  </MKTypography>
                </MKBox>
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
                    Light Level Sensing
                  </MKTypography>
                </MKBox>
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
                    Light Color Sensing
                  </MKTypography>
                </MKBox>
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
                    Humidity
                  </MKTypography>
                </MKBox>
                {/* </Grid> */}

                <MKButton
                  onClick={() =>
                    setBlueGreenMode(
                      start_bit,
                      blue_min_intensity,
                      blue_max_intensity,
                      green_max_intensity,
                      step_size,
                      step_duration
                    )
                  }
                  variant="gradient"
                  color="success"
                >
                  Start Streaming to Server
                </MKButton>
              </Stack>
            </Grid>
            <Grid item xs={12} xm={9} lg={9} spacing={2}>
              <AirSpecControl />
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
