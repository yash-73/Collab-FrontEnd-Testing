import {  useEffect, useState } from 'react'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import axios from "axios"

import {db} from "./config/firebase"
import {collection, query, where , onSnapshot} from "firebase/firestore"
import Requests from './components/Requests'




function App() {

  const projectId = 1

  const [requests, setRequests] = useState([])
  const isUserLoggedIn = async()=>{
    axios.get("http://localhost:8080/api/user/is-logged-in" ,  {withCredentials: true})
    .then(response => {
     console.log(response)
    })
    .catch((err)=> {
      console.log("Error: ", err)
    }) 
  }

 useEffect(()=>{
  isUserLoggedIn()
 },[])

 useEffect(()=>{
  const requestsRef =  collection(db, "ProjectJoinRequests");
  const q = query(requestsRef , where("projectId", "==", projectId) , where("status", "==", "PENDING"))

  const unsubscribe = onSnapshot(q, (snapshot)=>{
    const newRequest =  snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    setRequests(newRequest)
    newRequest.map(req => {
      console.dir(req)
    })
  })

  return ()=> unsubscribe();
 },[projectId])

  return (
   <div  className=' text-[30px] font-bold w-full p-8 flex flex-col items-center justify-center bg-red-400 '>
    <Login/>
    <Register/>
    <div>
      <h2>Project Join Requests</h2>
      <ul className='flex flex-row'>
        {requests.map((req) => (
          <Requests key={req.id} userId={req.userId} projectId={req.projectId} status={req.status}/>
        ))}
      </ul>
    </div>
  
   </div>
  )
}

export default App
