'use client';

import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function InvestmentPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/images/finance-investment.webp') center/cover no-repeat, linear-gradient(to bottom, #e8eaf6 70%, #21243d 100%)",
        position: "relative"
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, display: "flex", flexDirection: "row", alignItems: "flex-end", minHeight: 480 }}>
        <Box sx={{ flex: 1, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fff8" }}>
            <Typography variant="h4" gutterBottom>📈 Investment</Typography>
            <Typography paragraph>
              <b>What is Investment?</b> Investment is the process of allocating your money into assets (like stocks, bonds, real estate) with the expectation of earning a return or profit.
            </Typography>
            <Typography><b>Why Invest?</b></Typography>
            <List>
              <ListItem><ListItemText primary="Grow your wealth over time" /></ListItem>
              <ListItem><ListItemText primary="Beat inflation" /></ListItem>
              <ListItem><ListItemText primary="Achieve financial independence" /></ListItem>
            </List>
            <Typography sx={{ mt: 2 }}><b>Example:</b></Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography>
                Investing ₹10,000 in a mutual fund that grows at 10% per year could be worth more than ₹25,000 in 10 years.
              </Typography>
            </Paper>
          </Paper>
        </Box>
        <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
           <Box sx={{
            width: 0, height: 0,
            background: "",
            borderRadius: 24,
            boxShadow: '0 6px 36px #0002',
            position: "relative",
            overflow: "hidden"
          }}>
            <Box sx={{
              position: "relative",
              left: 0, bottom: 0, width: "100%", height: "60%",
              background: "url('/images/finance-investment.webp') center/cover no-repeat, linear-gradient(0deg, #21243d 80%, rgba(33,36,61,0.0) 100%)"
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}