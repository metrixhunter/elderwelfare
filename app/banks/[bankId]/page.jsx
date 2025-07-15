import ClientComponent from './ClientComponent';
import { Container, Typography } from '@mui/material';
import { notFound } from 'next/navigation';
import FloatingSecretButton from '../../secret/FloatingSecretButton';

export function generateStaticParams() {
  return ['sbi', 'hdfc', 'icici', 'axis'].map(bankId => ({ bankId }));
}

export default function BankDetails({ params }) {
  const { bankId } = params;

  const bankNames = {
    sbi: 'State Bank of India',
    hdfc: 'HDFC Bank',
    icici: 'ICICI Bank',
    axis: 'Axis Bank',
  };

  if (!bankNames[bankId]) {
    notFound(); // Redirects to Next.js 404 page if invalid bankId
  }

  return (
    <>
      <Container maxWidth="md" style={{ padding: '2rem' }}>
        <Typography variant="h3">{bankNames[bankId]}</Typography>
        <Typography variant="body1">
          Welcome to {bankNames[bankId]}'s page! Please verify your account details below.
        </Typography>

        <ClientComponent bankId={bankId} />
      </Container>
      <FloatingSecretButton />
    </>
  );
}





