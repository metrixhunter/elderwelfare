'use client';

import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function SafetyPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/images/finance-savings.webp') center/cover no-repeat, linear-gradient(to bottom, #e8eaf6 70%, #21243d 100%)",
        position: "relative"
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, display: "flex", flexDirection: "row", alignItems: "flex-end", minHeight: 480 }}>
        <Box sx={{ flex: 1, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fff8" }}>
            <Typography variant="h4" gutterBottom>🛡️ Financial Safety</Typography>
            <Typography paragraph>
              <b>What is Financial Safety?</b> Financial safety means protecting yourself and your money from risks like fraud, scams, and loss.
            </Typography>
            <Typography><b>How to Stay Safe:</b></Typography>
            <List>
              <ListItem><ListItemText primary="Use strong, unique passwords for your accounts" /></ListItem>
              <ListItem><ListItemText primary="Be alert for phishing emails and scams" /></ListItem>
              <ListItem><ListItemText primary="Monitor your accounts for suspicious activity" /></ListItem>
              <ListItem><ListItemText primary="Do not share sensitive information easily" /></ListItem>
            </List>
            <Typography sx={{ mt: 2 }}><b>Example:</b></Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography>
                If you get an unexpected call asking for your bank password, it's likely a scam. Never share your credentials on calls or emails.
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
              background: "url('/images/finance-savings.webp') center/cover no-repeat, linear-gradient(to bottom, #e8eaf6 70%, #21243d 100%)"
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}