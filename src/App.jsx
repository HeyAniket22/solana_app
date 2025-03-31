import React from 'react';
import {
    Box,
    Container,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography
} from '@mui/material';
import { WalletButton } from './components/WalletButton';
import { TokenOperations } from './components/TokenOperations';
import { TokenBalance } from './components/TokenBalance';
import { TransactionHistory } from './components/TransactionHistory';

function App() {
    return (
        <>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Solana Token Manager
                    </Typography>
                    <WalletButton />
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TokenOperations />
                    <TokenBalance />
                    <TransactionHistory />
                </Box>
            </Container>
        </>
    );
}

export default App;