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
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKSocialButton from "components/MKSocialButton";
import MKAlert from "components/MKAlert";

// Material Kit 2 React examples
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import DefaultFooter from "examples/Footers/DefaultFooter";
import FilledInfoCard from "examples/Cards/InfoCards/FilledInfoCard";

// Presentation page sections
import Counters from "pages/Presentation/sections/Counters";
import Information from "pages/Presentation/sections/Information";
import DesignBlocks from "pages/Presentation/sections/DesignBlocks";
import Pages from "pages/Presentation/sections/Pages";
import Testimonials from "pages/Presentation/sections/Testimonials";
import Download from "pages/Presentation/sections/Download";

// Presentation page components
import BuiltByDevelopers from "pages/Presentation/components/BuiltByDevelopers";


// Routes
import routes from "routes";
import footerRoutes from "footer.routes";

import 'assets/airspec.css';

// Images
// import bgImage from "assets/images/bg-presentation.jpg";
import bgImage from "assets/images/pexels-barnabas2.jpg"
import cloudImage from "assets/images/clouds.png";
import fogLow from "assets/images/fog-low.png";

function Presentation() {
  return (
    <>
      <DefaultNavbar
        routes={routes}
        sticky
      />

      <MKBox
        minHeight="75vh"
        width="100%"
        sx={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "top",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Container>
          <Grid container item xs={12} lg={7} justifyContent="center" mx="auto">
            <MKTypography
              variant="h1"
              color="white"
              mt={-6}
              mb={1}
              sx={({ breakpoints, typography: { size } }) => ({
                [breakpoints.down("md")]: {
                  fontSize: size["3xl"],
                },
              })}
            >

              AirSpec{" "}
            </MKTypography>
            <MKTypography
              variant="body1"
              color="white"
              textAlign="center"
              px={{ xs: 6, lg: 12 }}
              mt={1}
            >
              Free & Open Source Smart Eyeglass Platform Designed to Measure You and the Surrounding Environment
            </MKTypography>
          </Grid>
        </Container>
      </MKBox>
      <Card
        sx={{
          p: 2,
          mx: { xs: 2, lg: 3 },
          mt: -8,
          mb: 4,
          backgroundColor: ({ palette: { white }, functions: { rgba } }) => rgba(white.main, 0.8),
          backdropFilter: "saturate(200%) blur(30px)",
          boxShadow: ({ boxShadows: { xxl } }) => xxl,
        }}
      >
        <Counters />

        <MKBox pt={2} pb={6}>
          <Container>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6} ml="auto" sx={{ textAlign: { xs: "center", lg: "left" } }}>
                <MKTypography variant="h4" fontWeight="bold" mb={0.5}>
                  Questions? Send us an {" "}
                  <MKTypography
                    component="a"
                    href="mailto: chwalek@mit.edu"
                    target="_blank"
                    rel="noreferrer"
                    variant="h4"
                    fontWeight="bold"
                    color="info"
                  >
                    email!
                  </MKTypography>
                </MKTypography>
                <MKTypography variant="body1" color="text">
                  Interested in seeing our last smart eyeglass iteration?{" "}
                  <MKTypography
                    component="a"
                    href="https://captivate.media.mit.edu/"
                    target="_blank"
                    rel="noreferrer"
                    variant="body1"
                    fontWeight="bold"
                    color="info"
                  >
                    Project Captivate
                  </MKTypography>
                </MKTypography>
              </Grid>
            </Grid>
          </Container>
        </MKBox>
      </Card>

      <MKBox px={1}>
        <DefaultFooter content={footerRoutes} />
      </MKBox>
    </>
  );
}

export default Presentation;
