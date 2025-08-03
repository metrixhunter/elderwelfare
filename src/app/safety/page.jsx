'use client';

import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import { HeaderFooterWrapper } from '../layout';
export default function SafetyPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/images/legal-financial.jpg') center/cover no-repeat, linear-gradient(to bottom, #ede7f6 70%, #512da8 100%)",
        position: "relative"
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, display: "flex", flexDirection: "row", alignItems: "flex-end", minHeight: 480 }}>
        <Box sx={{ flex: 1, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fff8" }}>
            <Typography variant="h4" gutterBottom>⚖️ Legal & Financial Help</Typography>
            <Typography paragraph>
              <b>What is Legal & Financial Help?</b> This service provides elders with access to legal advice, financial planning, and protection against fraud or exploitation.
            </Typography>
            <Typography><b>Services Offered:</b></Typography>
            <List>
              <ListItem><ListItemText primary="Legal consultations and rights awareness" /></ListItem>
              <ListItem><ListItemText primary="Help with wills, pensions, and benefits" /></ListItem>
              <ListItem><ListItemText primary="Guidance on financial management" /></ListItem>
              <ListItem><ListItemText primary="Protection from scams and fraud" /></ListItem>
            </List>
            <Typography sx={{ mt: 2 }}><b>Example:</b></Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography>
                Mr. Gupta attends a free legal workshop that helps him understand his rights and avoid financial scams.
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
              background: "url('/images/legal-financial.jpg') center/cover no-repeat, linear-gradient(to bottom, #ede7f6 70%, #512da8 100%)"
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}