import MKTypography from "components/MKTypography";

import favicon from "assets/images/favicon.png";

const date = new Date().getFullYear();

export const footer_routes = {
  brand: {
    name: "AirSpec",
    image: favicon,
    route: "/",
  },
  socials: [],
  menus: [],
  copyright: (
    /* @ts-ignore */
    <MKTypography variant="button" fontWeight="regular">
      All rights reserved. Copyright &copy; {date} AirSpec by{" "}
      {/* @ts-ignore */}
      <MKTypography
        component="a"
        href="https://www.patrickchwalek.com"
        target="_blank"
        rel="noreferrer"
        variant="button"
        fontWeight="regular"
      >
        Patrick Chwalek
      </MKTypography>
      {" "}and{" "}
      {/* @ts-ignore */}
      <MKTypography
        component="a"
        href="https://www.davidbramsay.com/"
        target="_blank"
        rel="noreferrer"
        variant="button"
        fontWeight="regular"
      >
        David Ramsay
      </MKTypography>
    </MKTypography>
  ),
};


export default footer_routes;
