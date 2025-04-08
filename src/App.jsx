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
import Profile from "./components/Profile";
function App() {
  // const projectId = 1
  // const userId = 4

  // const [requests, setRequests] = useState([])
  // const [updatedRequests, setUpdatedRequests] = useState([])

  // const isUserLoggedIn = async()=>{
  //   axios.get("http://localhost:8080/api/auth/me" ,  {withCredentials: true})
  //   .then(response => {
  //    console.log(response)
  //   })
  //   .catch((err)=> {
  //     console.log("Error: ", err)
  //   })
  // }

  //  useEffect(()=>{
  //   isUserLoggedIn()
  //  },[])

  //  useEffect(()=>{
  //   const requestsRef =  collection(db, "ProjectJoinRequests");
  //   const q = query(requestsRef , where("projectId", "==", projectId) , where("status", "==", "PENDING" ))

  //   const unsubscribe = onSnapshot(q, (snapshot)=>{
  //     const newRequest =  snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }))

  //     setRequests(newRequest)
  //     newRequest.map(req => {
  //       console.dir(req)
  //     })
  //   })

  //   return ()=> unsubscribe();
  //  },[projectId])

  //  useEffect(()=>{
  //   const requestsRef =  collection(db, "ProjectJoinRequests");
  //   const q = query(requestsRef , where("userId", "==", 4) , where("status", "in",  ["ACCEPTED", "REJECTED"] ))

  //   const unsubscribe = onSnapshot(q, (snapshot)=>{
  //     const newRequest =  snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }))

  //     setUpdatedRequests(newRequest)
  //     newRequest.map(req => {
  //       console.dir(req)
  //     })
  //   })

  //   return ()=> unsubscribe();

  //  },[userId])

  // return (
  //  <div  className=' text-[30px] font-bold w-full p-8 flex flex-col items-center justify-center bg-red-400 '>

  //   <div>
  //     <h2>Project Join Requests</h2>
  //     <ul className='flex flex-row'>
  //       {requests.map((req) => (
  //         <Requests key={req.id} userId={req.userId} projectId={req.projectId} status={req.status}/>
  //       ))}
  //     </ul>
  //   </div>

  //   <div>
  //     <h2>Project Updated Requests</h2>
  //     <ul className='flex flex-col'>
  //       {
  //           updatedRequests.map(req=>(
  //             <SeenRequest key={req.id} projectId={req.projectId} userId={userId} status={req.status}/>
  //           ))
  //       }
  //     </ul>
  //   </div>

  //   <div>
  //     <SendJoinRequest/>
  //      </div>

  //      <GitHubLogin/>

  //  </div>
  // )

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<GitHubLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
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
