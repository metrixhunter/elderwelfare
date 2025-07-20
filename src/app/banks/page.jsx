'use client';

import { useRouter } from 'next/navigation';
import { Container, Card, CardContent, Button, Typography, Grid } from '@mui/material';
import FloatingSecretButton from '../secret/FloatingSecretButton';
import { selectOrOverrideBank } from './bankUtils';

const banks = [
  { name: 'State Bank of India', id: 'sbi' },
  { name: 'HDFC Bank', id: 'hdfc' },
  { name: 'ICICI Bank', id: 'icici' },
  { name: 'Axis Bank', id: 'axis' }
];

export default function BanksPage() {
  const router = useRouter();

  const handleBankClick = (id) => {
    // Use the universal function: returns true if correct, false if overridden
    selectOrOverrideBank(id);

    // Continue navigation as normal
    router.push(`/banks/${id}`);
  };

  return (
    <>
      <Container maxWidth="md" style={{ padding: '2rem' }}>
        <Typography variant="h4" gutterBottom textAlign="center">Select Your Bank</Typography>

        <Grid container spacing={2} justifyContent="center">
          {banks.map((bank) => (
            <Grid item xs={6} sm={4} md={3} key={bank.id}>
              <Card style={{ textAlign: 'center', cursor: 'pointer' }}>
                <CardContent>
                  <Typography variant="h6">{bank.name}</Typography>
                  <Button variant="contained" color="primary" fullWidth onClick={() => handleBankClick(bank.id)}>
                    Select
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <FloatingSecretButton />
    </>
  );
}
