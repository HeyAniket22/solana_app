import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Box, Typography } from '@mui/material';

export const WalletButton = () => {
    const { publicKey } = useWallet();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WalletMultiButton />
            {publicKey && (
                <Typography variant="body2">
                    Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </Typography>
            )}
        </Box>
    );
};