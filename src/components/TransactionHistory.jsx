import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Link
} from '@mui/material';

export const TransactionHistory = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!publicKey) return;

            setLoading(true);
            try {
                const signatures = await connection.getSignaturesForAddress(publicKey, {
                    limit: 10,
                });

                setTransactions(signatures);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [connection, publicKey]);

    if (!publicKey) {
        return (
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="body1">Connect your wallet to view transaction history</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Recent Transactions</Typography>

            {loading ? (
                <CircularProgress />
            ) : transactions.length > 0 ? (
                <List>
                    {transactions.map((tx, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={
                                    <Link
                                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        {tx.signature.slice(0, 10)}...{tx.signature.slice(-10)}
                                    </Link>
                                }
                                secondary={`Block: ${tx.slot}, ${new Date(tx.blockTime * 1000).toLocaleString()}`}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body1">No transactions found</Typography>
            )}
        </Paper>
    );
};