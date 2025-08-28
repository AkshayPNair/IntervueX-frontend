import api from './api'
import { WalletSummary, WalletTransaction } from '../types/wallet.types'

export const getInterviewerWalletSummary = async (): Promise<WalletSummary> => {
  const response = await api.get('/interviewer/wallet/summary')
  return response.data
}

export const getInterviewerWalletTransactions = async (): Promise<WalletTransaction[]> => {
  const response = await api.get('/interviewer/wallet/transactions')
  return response.data
}

export const getAdminWalletSummary = async (): Promise<WalletSummary> => {
  const response = await api.get('/admin/wallet/summary');
  return response.data;
};

export const getAdminWalletTransactions = async (): Promise<WalletTransaction[]> => {
  const response = await api.get('/admin/wallet/transactions');
  return response.data;
}

export const getUserWalletSummary=async ():Promise<WalletSummary>=>{
  const response=await api.get('/user/wallet/summary')
  return response.data
}

export const getUserWalletTransactions=async():Promise<WalletTransaction[]>=>{
  const response=await api.get('/user/wallet/transactions')
  return response.data
}