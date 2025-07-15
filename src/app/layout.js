'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Typography, Button, Box, Paper, Popover, Grid, List, ListItem, ListItemText, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './globals.css';

const exploreOptions = [
  { label: "Budgeting", href: "/budgeting" },
  { label: "Credit", href: "/credit" },
  { label: "Saving", href: "/saving" },
  { label: "Safety", href: "/safety" },
  { label: "Investment", href: "/investment" },
];
const calculatorOptions = [
  { label: "EMI Calculator" },
  { label: "Home Loan Calculator" },
  { label: "Education Loan EMI Calculator" },
  { label: "Personal Loan Calculator" },
  { label: "Currency Converter" },
  { label: "My Tools & Calculators" },
];
// Footer: main links should navigate, others are placeholders
const footerLinks = [
  {
    title: "Explore",
    links: [
      { label: "Budgeting", href: "/budgeting" },
      { label: "Credit", href: "/credit" },
      { label: "Investment", href: "/investment" },
      { label: "Saving", href: "/saving" },
      { label: "Safety", href: "/safety" }
    ]
  },
  {
    title: "What's new",
    links: [
      { label: "FinEdge AI" },
      { label: "Financial Reports" },
      { label: "Upcoming Features" },
      { label: "Blog" },
      { label: "Webinars" }
    ]
  },
  {
    title: "Tools & Calculators",
    links: [
      { label: "EMI Calculator" },
      { label: "Loan Tools" },
      { label: "Currency Converter" },
      { label: "My Tools" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About" },
      { label: "Support" },
      { label: "Careers" },
      { label: "Privacy" },
      { label: "Terms" }
    ]
  }
];

// Pages where the header and/or footer should appear
const mainHeaderPages = [
  '/', '/budgeting', '/credit', '/safety', '/saving', '/investment'
];
const showFooterPages = mainHeaderPages;

export default function Layout({ children }) {
  const pathname = usePathname();
  // Show header on main and all finance pages
  const showHeader = mainHeaderPages.includes(pathname);
  // Show footer on main and all finance pages
  const showFooter = showFooterPages.includes(pathname);

  // Popover state for header
  const [exploreAnchor, setExploreAnchor] = useState(null);
  const [calcAnchor, setCalcAnchor] = useState(null);

  return (
    <html lang="en">
      <body style={{ background: "#f5f8fa" }}>
        {/* HEADER: on main + all finance pages */}
        {showHeader && (
          <Box
            sx={{
              width: '100%',
              px: 4,
              py: 2,
              bgcolor: "#fff",
              boxShadow: '0 2px 8px 0 #0001',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 100
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Typography variant="h5" sx={{
                color: "#283593",
                fontWeight: 700,
                fontFamily: "inherit",
                letterSpacing: 1,
                mr: 3
              }}>
                finedge
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  color="primary"
                  endIcon={<ExpandMoreIcon />}
                  onClick={e => setExploreAnchor(e.currentTarget)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Explore
                </Button>
                <Popover
                  open={Boolean(exploreAnchor)}
                  anchorEl={exploreAnchor}
                  onClose={() => setExploreAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  <Box sx={{ p: 1 }}>
                    {exploreOptions.map(opt =>
                      <Button
                        key={opt.label}
                        href={opt.href}
                        component={Link}
                        fullWidth
                        sx={{ justifyContent: "flex-start", fontWeight: 500 }}
                        onClick={() => setExploreAnchor(null)}
                      >
                        {opt.label}
                      </Button>
                    )}
                  </Box>
                </Popover>
                <Button
                  color="primary"
                  endIcon={<ExpandMoreIcon />}
                  onClick={e => setCalcAnchor(e.currentTarget)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Financial Tools & Calculators
                </Button>
                <Popover
                  open={Boolean(calcAnchor)}
                  anchorEl={calcAnchor}
                  onClose={() => setCalcAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  <Box sx={{ p: 1 }}>
                    {calculatorOptions.map(opt =>
                      <Button
                        key={opt.label}
                        fullWidth
                        sx={{ justifyContent: "flex-start", fontWeight: 500 }}
                        disabled // not functional for now
                      >
                        {opt.label}
                      </Button>
                    )}
                  </Box>
                </Popover>
                <Button color="primary" sx={{ textTransform: "none", fontWeight: 600 }} disabled>
                  Support
                </Button>
                <Button color="primary" sx={{ textTransform: "none", fontWeight: 600 }} disabled>
                  About
                </Button>
              </Box>
            </Box>
            {pathname === '/' && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="text" href="/login" sx={{ fontWeight: 500 }}>LOGIN</Button>
                <Button variant="contained" color="secondary" href="/signup" sx={{ fontWeight: 600 }}>SIGNUP</Button>
              </Box>
            )}
          </Box>
        )}
        {/* MAIN CONTENT */}
        <main style={{ minHeight: "70vh" }}>
          {/* Only show main page content on /, else children */}
          {pathname === '/' ? <MainPageContent /> : children}
        </main>
        {/* FOOTER: only on main, budgeting, credit, safety, saving, investment */}
        {showFooter && <FooterLikeMicrosoft />}
      </body>
    </html>
  );
}

function MainPageContent() {
  return (
    <Box sx={{ position: "relative", minHeight: "70vh", px: 0 }}>
      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "flex-end",
        justifyContent: "space-between",
        width: "100%",
        minHeight: 320,
        px: { xs: 2, md: 8 },
        pt: 6,
        background: "url('/images/finance-hero.jpg') center/cover no-repeat, linear-gradient(to bottom, #e8eaf6 70%, #21243d 100%)",
        position: "relative"
      }}>
        <Box sx={{ maxWidth: 480, pb: 5 }}>
          <Typography variant="h3" sx={{ color: "white", fontWeight: 800, mb: 1, textAlign: "left" }}>
            Welcome to FinEdge
          </Typography>
          <Typography variant="h6" color="grey.300" sx={{ mb: 2, textAlign: "left" }}>
            Securely manage your finances and unlock your financial potential with ease.
          </Typography>
          <Paper elevation={3} sx={{ p: 3, mt: 2, textAlign: 'left', borderRadius: 3, background: "#fff8" }}>
            <Typography paragraph sx={{ mb: 1 }}>
              <b>FinEdge</b> is your all-in-one financial companion—helping you budget, save, invest, and protect your wealth.
              Our platform is designed for everyone: whether you’re a student, professional, or retiree, you’ll find tools and guidance for smarter money management.
            </Typography>
            <Typography paragraph sx={{ mb: 1 }}>
              <b>Specialty:</b> FinEdge is powered by an <b>AI assistant</b> that provides:
            </Typography>
            <Box component="ul" sx={{ pl: 4 }}>
              <li>Personalized savings advice</li>
              <li>Basic financial knowledge</li>
              <li>Guidance on money transfers within FinEdge</li>
              <li>Explanations of how money works</li>
              <li>And more—tailored for your needs!</li>
            </Box>
            <Typography paragraph sx={{ mt: 2 }}>
              <b>Get started by exploring our tools for budgeting, saving, investing, credit, and safety—from the header buttons above.</b>
            </Typography>
          </Paper>
        </Box>
        {/* Finance-themed image with dark tent/gradient at bottom */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <Box sx={{
            width: 0,
            height: 0,
            background: "",
            borderRadius: 24,
            boxShadow: '0 6px 36px #0002',
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Dark tent effect */}
            <Box sx={{
              position: "absolute",
              left: 0, bottom: 0, width: "100%", height: "60%",
              background: "url('/images/finance-hero.jpg') center/cover no-repeat, linear-gradient(to bottom, #e8eaf6 70%, #21243d 100%)"
            }} />
          </Box>
        </Box>
      </Box>
      {/* Optionally, add more images/features below */}
    </Box>
  );
}

// Footer with navigation for main finance links
function FooterLikeMicrosoft() {
  return (
    <Box sx={{
      bgcolor: "#f7f7f7",
      borderTop: "1px solid #e0e0e0",
      mt: 8,
      pb: 0
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {footerLinks.map(section => (
            <Grid item xs={12} sm={6} md={3} key={section.title}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{section.title}</Typography>
              <List dense>
                {section.links.map(link =>
                  link.href ? (
                    <ListItem key={link.label} disablePadding>
                      <Link href={link.href} passHref legacyBehavior>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontSize: "1rem", color: "#283593", cursor: "pointer" }}>
                              {link.label}
                            </Typography>
                          }
                        />
                      </Link>
                    </ListItem>
                  ) : (
                    <ListItem key={link.label} disablePadding>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: "1rem", color: "#222" }}>
                            {link.label}
                          </Typography>
                        }
                      />
                    </ListItem>
                  )
                )}
              </List>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Box sx={{
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", py: 1, px: 2, fontSize: 14, color: "#888"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span role="img" aria-label="globe">🌐</span> English (India)
            <Button variant="outlined" size="small" sx={{ mx: 1, p: 0.5, minWidth: 32, height: 28, fontSize: 13 }}>✓</Button>
            Your Privacy Choices
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            Contact FinEdge
            <span>Privacy</span>
            <span>Terms of use</span>
            <span>Trademarks</span>
            <span>About our ads</span>
            <span>© FinEdge 2025</span>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}