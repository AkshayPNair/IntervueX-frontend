import { useState, useEffect } from "react";
import { WalletSummary, WalletTransaction } from "../types/wallet.types";
import { getInterviewerWalletSummary, getInterviewerWalletTransactions } from "../services/walletService";

interface UseInterviewerWallet {
    summary: WalletSummary,
    transactions: WalletTransaction[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>
}

export const useInterviewerWallet = (): UseInterviewerWallet => {
    const [summary, setSummary] = useState<WalletSummary>({ balance: 0, totalCredits: 0, totalDebits: 0 })
    const [transactions, setTransactions] = useState<WalletTransaction[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAll = async () => {
        setLoading(true)
        setError(null)
        try {
            const [summary, transaction] = await Promise.all([
                getInterviewerWalletSummary(),
                getInterviewerWalletTransactions()
            ])
            console.log('Interviewer wallet summary:', summary)
            console.log('Interviewer wallet transactions:', transaction)
            setSummary(summary)
            setTransactions(Array.isArray(transaction) ? transaction : [])
        } catch (error: any) {
            console.error('Error loading interviewer wallet:', error)
            setError(error?.response?.data?.error || 'Failed to load wallet');
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchAll()
    }, [])

    return { summary, transactions, loading, error, refetch: fetchAll }
}