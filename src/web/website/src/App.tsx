/**
=========================================================
* Material Kit 2 React - v2.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-kit-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { ReactElement, useEffect } from 'react';
import {Route, useLocation, Routes} from "react-router-dom";

import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "assets/theme";
import { Main } from "./pages/Main";
import { routes, Route as RouteDefn } from "./routes";

export default function App() {
 const { pathname } = useLocation();

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;

    if (document.scrollingElement != null) document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes: RouteDefn[]): ReactElement[] => allRoutes.flatMap((route: RouteDefn) => {
    if (route.collapse) {
      return getRoutes(route.collapse);
    }

    if (route.route) {
      return [<Route path={route.route} element={route.component} key={route.key ?? route.route} />];
    }

    return [];
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Routes>
        {getRoutes(routes)}
        <Route index key={"index"} element={<Main/>}/>
      </Routes>
    </ThemeProvider>
  );
}
