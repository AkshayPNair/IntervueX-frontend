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
    async (error)=>{
        const originalRequest = error.config;

        if(originalRequest.url?.includes('/auth/')){
            return Promise.reject(error)
        }
        
        if(error.response && error.response.status===401 && !originalRequest._retry){
            originalRequest._retry = true;
            
            try {

                await api.post('/auth/refresh');
                return api(originalRequest);

            } catch (refreshError) {

                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                    window.location.href = '/auth';
                }

               return Promise.reject(refreshError);
           }
         }
        return Promise.reject(error)
    }
)

export default api