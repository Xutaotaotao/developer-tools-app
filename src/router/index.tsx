import {
  createBrowserRouter,
} from "react-router-dom";
import Root from "../layout";
import ErrorPage from "../pages/error-page";
import Home from "../pages/home";
import Image from '../pages/image'
import NetWorkTools from '../pages/network'

 
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path:'Image', element:<Image />},
      { path:'NetWorkTools', element:<NetWorkTools />}
    ],
  },
]);

export default router