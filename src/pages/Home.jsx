import { useEffect, useState } from 'react'

import Navbar from '../components/Navbar/Navbar'
// import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../store/AuthSlice'


import axios from 'axios'



function Home(){


    const [data, setData] = useState(null)
    const dispatch = useDispatch()

    const getUser = async () => {
    const response = await axios.get('http://localhost:8080/api/auth/me', {
        withCredentials: true
    })
    console.log(response.data)
    return response.data
}

useEffect(() => {
    const data =getUser();
    if(data.authenticated){
        const user = {
            isLoggedIn: true,
            data: {
                name: data.user.attributes.name,
                username: data.user.attributes.login,
                avatar: data.user.attributes.avatar_url,
                email: data.user.attributes.email,
                githubId: data.user.attributes.id,  
            }
        }

        dispatch(login(user))
    }

},[dispatch])


    return(
        <div className='text-white text-4xl bg-red-400'>
          Home
          <button className='bg-blue-500 text-white px-4 py-2 rounded-md' onClick={() => {
           setData(
            getUser()
           )
          }}>Getme</button>
          {data && <div>{data.name}</div>}
        </div>
    )
}

export default Home