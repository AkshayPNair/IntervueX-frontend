import api from "./api";
import { API_ROUTES } from '../constants/apiRoutes';

export interface CompileRunRequest{
    source:string;
    languageId:number;
    stdin?:string;
    cpuTimeLimit?:number;
    memoryLimit?:number;
}

export interface CompileRunResponse {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { id: number; description: string };
}

export interface Judge0Languages{
  id:number;
  name:string;
}

export const runOnServer=async(payload:CompileRunRequest):Promise<CompileRunResponse>=>{
    const response=await api.post(API_ROUTES.COMPILER.RUN,payload)
    return response.data
}

export const listLanguages=async():Promise<Judge0Languages[]> => {
  const response=await api.get(API_ROUTES.COMPILER.LANGUAGES)
  return response.data
}