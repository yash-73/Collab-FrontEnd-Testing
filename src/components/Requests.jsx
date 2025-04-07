import React from 'react'
import axios from "axios"
function Requests({id, userId, projectId, status}) {

    const handleUpdate = async (updatedStatus)=>{
            axios.put("http://localhost:8080/api/notification/update-request", 
                {
                    projectId: projectId,
                    userId: userId,
                    status: updatedStatus,
                    
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
            <button onClick={async (e)=> {
                e.preventDefault();
                handleUpdate("ACCEPTED");
            }} 
            className='bg-green-400'>Accept</button>
            <button 
            onClick={async (e)=>{
                e.preventDefault();
                handleUpdate("REJECTED")
            }}
            className='bg-red-400' 
            >Reject</button>

        </div>
    )
}

export default Requests
