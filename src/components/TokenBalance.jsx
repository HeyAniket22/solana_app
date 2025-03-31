import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getAccountInfo, getMint } from '@solana/spl-token';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    List,
    ListItem,
    ListItemText
} from '@mui/material';

export const TokenBalance = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!publicKey) return;

            setLoading(true);
            try {
                // Fetch SOL balance
                const solBalance = await connection.getBalance(publicKey);
                setBalance(solBalance / 10 ** 9);

                // Fetch token accounts (simplified - in a real app you'd want more robust token detection)
                const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
                    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
                });

                const tokenData = await Promise.all(
                    tokenAccounts.value.map(async (account) => {
                        const accountInfo = await getAccountInfo(connection, account.pubkey);
                        const mintInfo = await getMint(connection, accountInfo.mint);

                        return {
                            mint: accountInfo.mint.toString(),
                            balance: Number(accountInfo.amount) / 10 ** mintInfo.decimals,
                            decimals: mintInfo.decimals,
                            symbol: mintInfo.symbol || 'Unknown',
                        };
                    })
                );

                setTokens(tokenData);
            } catch (error) {
                console.error('Error fetching balances:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, [connection, publicKey]);

    if (!publicKey) {
        return (
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="body1">Connect your wallet to view balances</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Wallet Balances</Typography>

            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <Typography variant="h6">SOL Balance: {balance} SOL</Typography>

                    <Typography variant="h6" sx={{ mt: 2 }}>Token Balances:</Typography>
                    {tokens.length > 0 ? (
                        <List>
                            {tokens.map((token, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={`${token.balance} ${token.symbol}`}
                                        secondary={`Mint: ${token.mint}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body1">No tokens found</Typography>
                    )}
                </>
            )}
        </Paper>
    );
};