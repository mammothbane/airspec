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

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Box from '@mui/material/Box';

// Material Kit 2 React examples
import DefaultCounterCard from "components/DefaultCounterCard";

function Counters() {
  // @ts-ignore
  return <Box component="section" py={3}>
    <Container>
      <Grid container item xs={12} lg={9} sx={{ mx: "auto" }}>
        <Grid item xs={12} md={4}>
          {/* @ts-ignore */}
          <DefaultCounterCard
            count={30}
            suffix="+"
            title="Sensor Dimensions"
            description="Equipped to sense both the invironment and environment"
          />
        </Grid>
        <Grid item xs={12} md={4} display="flex">
          <Divider orientation="vertical" sx={{ display: { xs: "none", md: "block" }, mx: 0 }} />
          {/* @ts-ignore */}
          <DefaultCounterCard
            count={18}
            title="LEDs"
            description="For inward and outward actuation, including subtle notification to the wearer"
          />
          <Divider orientation="vertical" sx={{ display: { xs: "none", md: "block" }, ml: 0 }} />
        </Grid>
        <Grid item xs={12} md={4}>
          {/* @ts-ignore */}
          <DefaultCounterCard
            count={10}
            suffix="+"
            title="Hours"
            description="All-day battery life"
          />
        </Grid>
      </Grid>
    </Container>
  </Box>;
}

export default Counters;
