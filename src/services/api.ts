import axios from 'axios'

const api=axios.create({
    baseURL:process.env.NEXT_PUBLIC_BASE_URL,
    withCredentials: true,
})

api.interceptors.request.use(
    (config)=>{ 
        return config
    }
)

api.interceptors.response.use(
    (response)=>response,
    (error)=>{
        if(error.response && error.response.status===401){
            
        }
        return Promise.reject(error)
    }
)

export default api