'use client';

import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function CreditPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/images/finance-credit.jpg') center/cover no-repeat, linear-gradient(to bottom, #e8eaf6 70%, #21243d 100%)",
        position: "relative"
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, display: "flex", flexDirection: "row", alignItems: "flex-end", minHeight: 480 }}>
        <Box sx={{ flex: 1, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fff8" }}>
            <Typography variant="h4" gutterBottom>💳 Credit</Typography>
            <Typography paragraph>
              <b>What is Credit?</b> Credit is a contractual agreement in which a borrower receives something of value now and agrees to repay the lender at a later date—generally with interest. 
              It also refers to creditworthiness or credit history.
            </Typography>
            <Typography><b>Types of Credit:</b></Typography>
            <List>
              <ListItem><ListItemText primary="Personal Loans" /></ListItem>
              <ListItem><ListItemText primary="Credit Cards" /></ListItem>
              <ListItem><ListItemText primary="Home Loans" /></ListItem>
              <ListItem><ListItemText primary="Car Loans" /></ListItem>
            </List>
            <Typography sx={{ mt: 2 }}><b>Example:</b></Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography>
                If you buy a phone for ₹20,000 on your credit card and repay it over 6 months, you may pay additional interest based on your card's terms.
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
              position: "absolute",
              left: 0, bottom: 0, width: "100%", height: "60%",
              background: "url('/images/finance-credit.jpg') center/cover no-repeat, linear-gradient(to bottom, #e8eaf6 70%, #21243d 100%)"
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}