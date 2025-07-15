'use client';

import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function SavingPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/images/finance-safety.webp') center/cover no-repeat, linear-gradient(to bottom, #e8eaf6 70%, #21243d 100%)",
        position: "relative"
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, display: "flex", flexDirection: "row", alignItems: "flex-end", minHeight: 480 }}>
        <Box sx={{ flex: 1, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fff8" }}>
            <Typography variant="h4" gutterBottom>🏦 Saving</Typography>
            <Typography paragraph>
              <b>What is Saving?</b> Saving is the act of setting aside a portion of your income for future use, rather than spending it immediately.
            </Typography>
            <Typography><b>Benefits of Saving:</b></Typography>
            <List>
              <ListItem><ListItemText primary="Provides security for emergencies" /></ListItem>
              <ListItem><ListItemText primary="Helps achieve big goals (buying a house, car, etc.)" /></ListItem>
              <ListItem><ListItemText primary="Reduces financial stress and anxiety" /></ListItem>
            </List>
            <Typography sx={{ mt: 2 }}><b>Example:</b></Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography>
                If you save ₹2,000 every month, after one year you'll have ₹24,000—enough for a vacation, an emergency fund, or the start of an investment.
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
              background: "url('/images/finance-safety.webp') center/cover no-repeat, linear-gradient(to bottom, #e8eaf6 70%, #21243d 100%)"
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}