import api from './api'
import { API_ROUTES } from '../constants/apiRoutes';
import { WalletSummary, WalletTransaction } from '../types/wallet.types'

export const getInterviewerWalletSummary = async (): Promise<WalletSummary> => {
  const response = await api.get(API_ROUTES.INTERVIEWER.WALLET_SUMMARY)
  return response.data
}

export const getInterviewerWalletTransactions = async (): Promise<WalletTransaction[]> => {
  const response = await api.get(API_ROUTES.INTERVIEWER.WALLET_TRANSACTIONS)
  return response.data
}

export const getAdminWalletSummary = async (): Promise<WalletSummary> => {
  const response = await api.get(API_ROUTES.ADMIN.WALLET_SUMMARY);
  return response.data;
};

export const getAdminWalletTransactions = async (searchQuery?: string): Promise<WalletTransaction[]> => {
  const params = searchQuery ? { search: searchQuery } : {};
  const response = await api.get(API_ROUTES.ADMIN.WALLET_TRANSACTIONS, { params });
  return response.data;
}

export const getUserWalletSummary=async ():Promise<WalletSummary>=>{
  const response=await api.get(API_ROUTES.USER.WALLET_SUMMARY)
  return response.data
}

export const getUserWalletTransactions=async():Promise<WalletTransaction[]>=>{
  const response=await api.get(API_ROUTES.USER.WALLET_TRANSACTIONS)
  return response.data
}