import {useState} from 'react'
import axios from "axios"

function SendJoinRequest() {

    const [projectId, setProjectId] = useState()

    const handleSendRequest = async(e)=>{
        e.preventDefault();
        axios.post("http://localhost:8080/api/notification/join-request",
            {
                projectId: projectId
            },
            {
                withCredentials: true
            }
        )
        .then(response => console.log(response))
        .catch(err => console.log("Error: ", err))

    }


    return (
        <div>
        <input type="number" value={projectId} onChange={(e)=>{setProjectId(e.target.value)}} placeholder='Project Id' />
        <button
        onClick={handleSendRequest} 
        className='bg-black text-white cursor-pointer  m-8 px-4 py-2 rounded-xl hover:text-black hover:bg-white duration-300'
        >Send Request</button>
        </div>
    )
}

export default SendJoinRequest
