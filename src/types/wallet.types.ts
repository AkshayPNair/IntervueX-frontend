export type WalletRole = 'admin'|'interviewer'|'user'
export type WalletTnxType='credit'|'debit'

export interface WalletSummary{
    balance:number;
    totalCredits:number;
    totalDebits:number;
}

export interface WalletTransaction {
    id: string;
    walletId: string;
    userId: string;
    role: WalletRole;
    type: WalletTnxType;
    amount: number;
    interviewerFee?: number;
    adminFee?: number;
    reason: string;
    bookingId?: string;
    userName?: string;
    createdAt: string;
  }