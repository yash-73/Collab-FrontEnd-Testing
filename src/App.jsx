// import { useEffect, useState } from "react";
// import "./App.css";

// import axios from "axios";

// import { db } from "./config/firebase";
// import { collection, query, where, onSnapshot } from "firebase/firestore";
// import Requests from "./components/Requests";
// import SeenRequest from "./components/SeenRequest";
// import SendJoinRequest from "./components/SendJoinRequest";
// import GitHubLogin from "./components/GitHubLogin";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Provider } from "react-redux";
import authStore from "./store/AuthStore";
import { RouterProvider } from "react-router-dom";
import GitHubLogin from "./components/GitHubLogin";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Project from "./pages/Project";
import CustomProject from "./pages/CustomProject";
import CollaborateProject from "./pages/CollaborateProject";
import CollaborateMessage from "./pages/CollaborateMessage";
import Notifications from "./components/Notifications";
import EditProfile from "./pages/EditProfile";

function App() {
  

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<GitHubLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/projects" element={<Project />} />
        <Route path="/project/:projectId" element={<CustomProject />} />
        <Route path="/project/:projectId/collaborate" element={<CollaborateProject />} />
        <Route path="/project/:projectId/collaborate/message" element={<CollaborateMessage />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
    )
  );

  return (
    <Provider store={authStore}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
