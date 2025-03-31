import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    createTransferInstruction
} from '@solana/spl-token';
import {
    Button,
    TextField,
    Box,
    Typography,
    Paper,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';

export const TokenOperations = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [decimals, setDecimals] = useState('9');
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [createdToken, setCreatedToken] = useState(null);

    const handleCreateToken = async () => {
        if (!publicKey) {
            setSnackbar({ open: true, message: 'Please connect your wallet', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            const mint = await createMint(
                connection,
                publicKey,
                publicKey,
                publicKey,
                parseInt(decimals)
            );

            setCreatedToken(mint.toString());
            setSnackbar({
                open: true,
                message: `Token created successfully: ${mint.toString()}`,
                severity: 'success'
            });
        } catch (error) {
            console.error('Error creating token:', error);
            setSnackbar({
                open: true,
                message: `Failed to create token: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMintTokens = async () => {
        if (!publicKey || !createdToken) {
            setSnackbar({ open: true, message: 'Please create a token first', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            const mintPublicKey = new PublicKey(createdToken);
            const tokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                publicKey,
                mintPublicKey,
                publicKey
            );

            await mintTo(
                connection,
                publicKey,
                mintPublicKey,
                tokenAccount.address,
                publicKey,
                BigInt(amount) * BigInt(10 ** parseInt(decimals))
            );

            setSnackbar({
                open: true,
                message: `Successfully minted ${amount} tokens`,
                severity: 'success'
            });
        } catch (error) {
            console.error('Error minting tokens:', error);
            setSnackbar({
                open: true,
                message: `Failed to mint tokens: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendTokens = async () => {
        if (!publicKey || !createdToken || !recipient) {
            setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            const mintPublicKey = new PublicKey(createdToken);
            const recipientPublicKey = new PublicKey(recipient);

            // Get sender's token account
            const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                publicKey,
                mintPublicKey,
                publicKey
            );

            // Get or create recipient's token account
            const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                publicKey,
                mintPublicKey,
                recipientPublicKey
            );

            // Create transfer instruction
            const transaction = new Transaction().add(
                createTransferInstruction(
                    senderTokenAccount.address,
                    recipientTokenAccount.address,
                    publicKey,
                    BigInt(amount) * BigInt(10 ** parseInt(decimals)))
                );

            // Send transaction
            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');

            setSnackbar({
                open: true,
                message: `Successfully sent ${amount} tokens to ${recipient}`,
                severity: 'success'
            });
        } catch (error) {
            console.error('Error sending tokens:', error);
            setSnackbar({
                open: true,
                message: `Failed to send tokens: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>Token Operations</Typography>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Create Token</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        label="Token Name"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Token Symbol"
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Decimals"
                        type="number"
                        value={decimals}
                        onChange={(e) => setDecimals(e.target.value)}
                        fullWidth
                    />
                </Box>
                <Button
                    variant="contained"
                    onClick={handleCreateToken}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Create Token'}
                </Button>
            </Box>

            {createdToken && (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Mint Tokens</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                label="Amount to Mint"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                fullWidth
                            />
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleMintTokens}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Mint Tokens'}
                        </Button>
                    </Box>

                    <Box>
                        <Typography variant="h6" gutterBottom>Send Tokens</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                label="Recipient Address"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Amount to Send"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                fullWidth
                            />
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleSendTokens}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Send Tokens'}
                        </Button>
                    </Box>
                </>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};