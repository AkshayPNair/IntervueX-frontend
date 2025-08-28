import { useState,useEffect } from "react";
import { WalletSummary,WalletTransaction } from "../types/wallet.types";
import { getAdminWalletSummary,getAdminWalletTransactions } from "../services/walletService";

interface UseAdminWallet{
    summary:WalletSummary;
    transactions:WalletTransaction[];
    loading:boolean;
    error:string|null;
    refetch:()=>Promise<void>
}

export const useAdminWallet=():UseAdminWallet=>{
    const [summary, setSummary] = useState<WalletSummary>({ balance: 0, totalCredits: 0, totalDebits: 0 });
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
          const [summary, transaction] = await Promise.all([
            getAdminWalletSummary(),
            getAdminWalletTransactions()
          ]);
          setSummary(summary);
          setTransactions(transaction);
        } catch (error: any) {
          setError(error?.response?.data?.error || 'Failed to load wallet');
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => { 
        fetchAll()
    }, []);
    
      return { summary, transactions, loading, error, refetch: fetchAll };
}