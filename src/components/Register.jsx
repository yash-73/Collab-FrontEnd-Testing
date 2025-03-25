import {useState} from 'react'
import axios from "axios"

function Register () {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("")


    const handleRegister = async(e)=>{
            e.preventDefault();


            if(password === confirmPassword){
                axios.post("http://localhost:8080/api/user/register", 
                    {
                        username: username,
                        email: email,
                        password: password
                    },
                    {
                        withCredentials: true
                    }
                )
            }

            else {
                setError("Passwords don't match")
            }
            




    }

    return (
        <div>
            <form action="submit" className='flex flex-col items-center border-2 border-black rounded-lg p-8'>

                <label htmlFor="rusername">Username</label>
                <input type="text" id='rusername' value={username} onChange={(e)=>{setUsername(e.target.value)}}  required autoComplete='off'
                 className='outline-none border-[2px] border-gray-600 focus:border-black'  />

                <label htmlFor="email">Email</label>
                <input type="text" id='email' value={email} onChange={(e)=>{setEmail(e.target.value)}} required  autoComplete='off'
                 className='outline-none border-[2px] border-gray-600 focus:border-black'  />

                <label htmlFor="rpassword">Password</label>
                <input type="text" id='rpassword' value={password} onChange={(e)=>{setPassword(e.target.value)}} required autoComplete='off'
                 className='outline-none border-[2px] border-gray-600 focus:border-black'  />

                <label htmlFor="confirm-password">Confirm Password</label>
                <input type="text" id='confirm-password' value={confirmPassword} onChange={(e)=>{setConfirmPassword(e.target.value)}} required  
                autoComplete='off' className='outline-none border-[2px] border-gray-600 focus:border-black'  />

                {error && <span className='text-white text-[20px]'>{error}</span>}

                <button onClick={handleRegister} 
                 className='bg-black text-white cursor-pointer  m-8 px-4 py-2 rounded-xl hover:text-black hover:bg-white duration-300'
                >Register</button>
            </form>
        </div>
    )
}

export default Register;
