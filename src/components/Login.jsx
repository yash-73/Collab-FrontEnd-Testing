import { useState} from 'react'
import axios from "axios"
function Login() {

    const [username, setUsername] = useState("")
    const [pass, setPass] = useState("")
    const [verified, setVerified] = useState(true);

    const handleClick = async (e)=>{
        e.preventDefault();
        console.log("Username: ", username);
        console.log("Password: ", pass)
        axios.post("http://localhost:8080/api/user/login", {
            username: username,
            password: pass
        },
    {
        withCredentials: true
    })
    .then(response => {
        console.log(response);
        setVerified(true);
    })
    .catch(error => console.log("Error: ", error))

    }

    const getData =async (e)=>{
            e.preventDefault();
            axios.get("http://localhost:8080/api/user/getusers" ,
                
                {
                    withCredentials: true,
                }
            )
            .then(response => {
                const data = response.data
                console.log(data);

            })
            .catch(err => {
                console.log("Error: ", err)
            })
    }

    const handleLogout = async(e)=>{
        e.preventDefault();
        axios.post("http://localhost:8080/api/user/logout" , 
            {},
            {
                withCredentials: true
            }
        )
        .then(response => {
            console.log(response);
            setVerified(false);
        })
        .catch(err => {
            console.log("Error: ", err)
        })
    }

    
    return (
        <div>
                <form action="submit" className='flex flex-col items-center'>

                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" value={username}   onChange={(e)=>{setUsername(e.target.value)}} 
                        className='outline-none border-[2px] border-gray-600 focus:border-black' 
                    />

                    <label htmlFor="password">Password</label>
                    <input type="password" id='password' value={pass} onChange={(e)=>{setPass(e.target.value)}} 
                     className='outline-none border-[2px] border-gray-600 focus:border-black' 
                     />

                    <button onClick={handleClick} 
                    className=' bg-black text-white cursor-pointer  m-8 px-4 py-2 rounded-xl hover:text-black hover:bg-white duration-300'>Login</button> 
                </form>

                {verified && 
                <div>
                    <button onClick={getData} 
                     className=' bg-black text-white cursor-pointer  m-8 px-4 py-2 rounded-xl hover:text-black hover:bg-white duration-300'
                     >Get User data</button>
                </div> }

                <div className=' flex justify-center w-full'>
                    <button onClick={handleLogout} className='bg-black text-white cursor-pointer  m-8 px-4 py-2 rounded-xl hover:text-black hover:bg-white duration-300'>Logout</button>
                    </div>

        </div>
    )
}

export default Login
