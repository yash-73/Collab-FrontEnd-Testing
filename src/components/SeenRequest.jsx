import React from 'react'
import axios from 'axios'

function SeenRequest({id, projectId,userId, status}) {


    const handleRequestSeen = async (e)=>{
            e.preventDefault();
            axios.delete(`http://localhost:8080/api/notification/seen-request/${userId}/${projectId}`,
                {
                    withCredentials: true
                }
            )
        .then((response) => {
            console.dir(response)
            
        }).catch((err) => {
            console.log("Error: ", err)
        });

    }
    return (
        <div className='border-2 border-black p-4 flex flex-col items-center' key={id}>
            {status === "ACCEPTED" && <p>Your request for project: {projectId} was accepted</p> }
            {status == "REJECTED" && <p>Your request for project: {projectId} was rejected</p>}
            <button onClick={handleRequestSeen} className='bg-blue-400'>Ok</button>
        </div>
    )
}

export default SeenRequest
