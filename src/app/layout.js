'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Typography, Button, Box, Paper, Popover, Grid, List, ListItem, ListItemText, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './globals.css';

// Update navigation for elder welfare theme
const exploreOptions = [
  { label: "Care Services", href: "/budgeting" },
  { label: "Health & Wellness", href: "/credit" },
  { label: "Community Support", href: "/saving" },
  { label: "Legal & Financial Help", href: "/safety" },
  { label: "Resources", href: "/investment" },
];

const getInvolvedOptions = [
  { label: "Volunteer", href: "/signup" }, // Volunteer now goes to signup page
  { label: "Donate", href: "/donate" },
  { label: "Share Your Story", href: "/stories" },
];

// Footer links for elder welfare
const footerLinks = [
  {
    title: "Explore",
    links: [
      { label: "Care Services", href: "/budgeting" },
      { label: "Health & Wellness", href: "/credit" },
      { label: "Community Support", href: "/saving" },
      { label: "Legal & Financial Help", href: "/safety" },
      { label: "Resources", href: "/investment" }
    ]
  },
  {
    title: "Get Involved",
    links: [
      { label: "Volunteer", href: "/signup" }, // Volunteer now goes to signup page
      { label: "Donate", href: "/donate" },
      { label: "Share Your Story", href: "/stories" }
    ]
  },
  {
    title: "About",
    links: [
      { label: "Our Mission", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" }
    ]
  }
];

// Pages where the header/footer should appear
const mainHeaderPages = [
  '/',
  '/budgeting',
  '/credit',
  '/saving',
  '/safety',
  '/investment'
];
const showFooterPages = mainHeaderPages;

export function HeaderFooterWrapper({ children }) {
  const pathname = usePathname();
  const showHeader = mainHeaderPages.includes(pathname);
  const showFooter = showFooterPages.includes(pathname);

  // Popover state for header
  const [exploreAnchor, setExploreAnchor] = useState(null);
  const [involvedAnchor, setInvolvedAnchor] = useState(null);

  return (
    <>
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
            {/* Logo and Name */}
            <Typography variant="h5" sx={{
              color: "#2E7D32",
              fontWeight: 700,
              fontFamily: "inherit",
              letterSpacing: 1,
              mr: 3
            }}>
              <span role="img" aria-label="care" style={{ marginRight: 8 }}>🤝</span>
              ElderWelfare
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
                onClick={e => setInvolvedAnchor(e.currentTarget)}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Get Involved
              </Button>
              <Popover
                open={Boolean(involvedAnchor)}
                anchorEl={involvedAnchor}
                onClose={() => setInvolvedAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <Box sx={{ p: 1 }}>
                  {getInvolvedOptions.map(opt =>
                    <Button
                      key={opt.label}
                      href={opt.href}
                      component={Link}
                      fullWidth
                      sx={{ justifyContent: "flex-start", fontWeight: 500 }}
                      onClick={() => setInvolvedAnchor(null)}
                    >
                      {opt.label}
                    </Button>
                  )}
                </Box>
              </Popover>
              <Button color="primary" href="/about" sx={{ textTransform: "none", fontWeight: 600 }}>
                About
              </Button>
              <Button color="primary" href="/contact" sx={{ textTransform: "none", fontWeight: 600 }}>
                Contact
              </Button>
            </Box>
          </Box>
          {/* Auth buttons on home page */}
          {pathname === '/' && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="text" href="/login" sx={{ fontWeight: 500 }}>LOGIN</Button>
              <Button variant="contained" color="secondary" href="/signup" sx={{ fontWeight: 600 }}>SIGNUP</Button>
            </Box>
          )}
        </Box>
      )}
      {children}
      {showFooter && <FooterElderWelfare />}
    </>
  );
}

export default function Layout({ children }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body style={{ background: "#f7fafc" }}>
        {/* MAIN CONTENT */}
        <main style={{ minHeight: "70vh" }}>
          {pathname === '/' ? <MainPageContent /> : <HeaderFooterWrapper>{children}</HeaderFooterWrapper>}
        </main>
      </body>
    </html>
  );
}

function MainPageContent() {
  return (
    <HeaderFooterWrapper>
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
          background: "url('/images/elder-hero.png') center/cover no-repeat, linear-gradient(to bottom, #e8f5e9 70%, #2E7D32 100%)",
          position: "relative"
        }}>
          <Box sx={{ maxWidth: 480, pb: 5 }}>
            <Typography variant="h3" sx={{ color: "white", fontWeight: 800, mb: 1, textAlign: "left" }}>
              Welcome to ElderWelfare
            </Typography>
            <Typography variant="h6" color="grey.300" sx={{ mb: 2, textAlign: "left" }}>
              Caring for elders. Building dignity, community, and support—for today and tomorrow.
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 2, textAlign: 'left', borderRadius: 3, background: "#fff8" }}>
              <Typography paragraph sx={{ mb: 1 }}>
                <b>ElderWelfare</b> is your platform for elder care and mutual support. By caring for elders now, you help build a community where everyone is supported—now and in the future.
              </Typography>
              <Typography paragraph sx={{ mb: 1 }}>
                <b>What We Offer:</b>
              </Typography>
              <Box component="ul" sx={{ pl: 4 }}>
                <li>Care services: health, home, wellness, and companionship</li>
                <li>Legal and financial help for elders</li>
                <li>Community and volunteer support</li>
                <li>Resource library for guides and assistance</li>
                <li>Share your story—be part of our caring community!</li>
              </Box>
              <Typography paragraph sx={{ mt: 2 }}>
                <b>Get started by exploring our services, joining our volunteer program, or accessing resources—from the header buttons above.</b>
              </Typography>
            </Paper>
          </Box>
          {/* Eldercare-themed image */}
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
              {/* Replace with your own image */}
              <Box sx={{
                position: "absolute",
                left: 0, bottom: 0, width: "100%", height: "60%",
                background: "url('/images/elder-hero.png') center/cover no-repeat, linear-gradient(to bottom, #e8f5e9 70%, #2E7D32 100%)"
              }} />
            </Box>
          </Box>
        </Box>
        {/* Add more features and testimonials below as needed */}
      </Box>
    </HeaderFooterWrapper>
  );
}

// Footer for ElderWelfare
function FooterElderWelfare() {
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
                            <Typography sx={{ fontSize: "1rem", color: "#2E7D32", cursor: "pointer" }}>
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
            Contact ElderWelfare
            <span>Privacy</span>
            <span>Terms of use</span>
            <span>About our ads</span>
            <span>© ElderWelfare 2025</span>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}