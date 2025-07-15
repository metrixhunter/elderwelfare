'use client';
import { Container, Typography, Box, Divider, Link } from '@mui/material';

export default function FooterFinancialNav({ links }) {
  return (
    <Box style={{ backgroundColor: '#f5f5f5', padding: '2rem', marginTop: '2rem' }}>
      <Container maxWidth="md">
        <Typography variant="h6" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>🔎 Explore More</Typography>
        <Divider style={{ marginBottom: '1rem' }} />
        <Box display="flex" flexWrap="wrap" justifyContent="space-between">
          {links.map((item) => (
            <Link key={item.href} href={item.href} underline="hover">{item.label}</Link>
          ))}
        </Box>
      </Container>
    </Box>
  );
}