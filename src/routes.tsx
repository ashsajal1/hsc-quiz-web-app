import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import RootLayout from "./pages/Layout";
import NotFound from "./pages/not-found";
import About from "./pages/about";
import Login from "./pages/login";
import Signup from "./pages/signup";
import PrivateRoute from "./pages/private-route";
import Dashboard from "./pages/dashboard";
import QuizPage from "./pages/quiz";
import ExamPage from "./pages/exam";
import SavedPage from "./pages/saved";
import Preview from "./pages/preview";
import QuestionPage from "./pages/question";
import Puzzle from "./pages/puzzle";

export const router = createBrowserRouter([
  {
    path: "",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/quiz/*",
        element: <QuizPage />,
      },
      {
        path: "/exam/*",
        element: <ExamPage />,
      },
      {
        path: "/saved/*",
        element: <SavedPage />,
      },
      {
        path: "/preview/*",
        element: <Preview />,
      },
      {
        path: "/question/*",
        element: <QuestionPage />,
      },
      {
        path: "/puzzle/*",
        element: <Puzzle />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "",
        element: <PrivateRoute />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
]);
