'use client';

import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import { HeaderFooterWrapper } from '../layout';
export default function BudgetingPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/images/care-services.jpg') center/cover no-repeat, linear-gradient(to bottom, #e8f5e9 70%, #2E7D32 100%)",
        position: "relative",
        boxShadow: '0 6px 36px #0002',
      }}
    >
      <Container maxWidth="md" sx={{ py: 8, display: "flex", flexDirection: "row", alignItems: "flex-end", minHeight: 480 }}>
        <Box sx={{ flex: 1, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fff8" }}>
            <Typography variant="h4" gutterBottom>🤝 Care Services</Typography>
            <Typography paragraph>
              <b>What are Care Services?</b> Care services provide essential support for elders, including assistance with daily activities, health monitoring, and companionship. These services help maintain dignity, independence, and quality of life.
            </Typography>
            <Typography><b>Types of Care Services:</b></Typography>
            <List>
              <ListItem><ListItemText primary="Home care and personal assistance" /></ListItem>
              <ListItem><ListItemText primary="Medical support and nursing" /></ListItem>
              <ListItem><ListItemText primary="Meal delivery and nutrition" /></ListItem>
              <ListItem><ListItemText primary="Companionship and social visits" /></ListItem>
            </List>
            <Typography sx={{ mt: 2 }}><b>Example:</b></Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography>
                Mrs. Sharma receives daily home care visits for help with medication and meals, ensuring she stays healthy and connected to her community.
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
              background: "url('/images/care-services.jpg') center/cover no-repeat, linear-gradient(to bottom, #e8f5e9 70%, #2E7D32 100%)",
              boxShadow: '0 6px 36px #0002',
            }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}


  
  