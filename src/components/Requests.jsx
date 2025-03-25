import React from 'react'
import axios from "axios"
function Requests({id, userId, projectId, status}) {

    const handleAccept = async ()=>{
            axios.put("http://localhost:8080/api/notification/accept-request", 
                {
                    projectId: projectId,
                    userId: userId,
                    status: status,
                    
                },
                {
                    withCredentials: true
                }
            )
            .then(response => {
                console.dir(response);
            })
            .catch(err=> {
                console.log("Error: ", err)
            })
    }
    return (
        <div key={id} className='flex flex-col items-center justify-center w-[200px]  bg-blue-300' > 
            <div>
                    UserID: {userId}
            </div>
            <div>
                ProjectId: {projectId}
            </div>
            <div>
                Status: {status}
            </div>
            <button onClick={(e)=> {
                e.preventDefault();
                handleAccept();
            }} className='bg-green-400'>Accept</button>
            <button className='bg-red-400' >Reject</button>

        </div>
    )
}

export default Requests
