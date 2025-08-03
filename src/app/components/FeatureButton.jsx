'use client';

import React from 'react';
import Link from 'next/link';

const FeatureButton = ({ icon, label, href }) => {
  return (
    <Link href={href} passHref>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 4,
          padding: 8,
          borderRadius: 12,
          background: '#f8faff',
          minWidth: 65,
          minHeight: 65,
          maxWidth: 85,
          maxHeight: 85,
          boxShadow: '0 1.5px 6px 0 rgba(80,120,160,0.08)',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
        tabIndex={0}
        role="button"
        aria-label={label}
      >
        <div style={{ fontSize: 32, color: '#1976d2', marginBottom: 4 }}>{icon}</div>
        <span style={{
          color: '#1976d2',
          fontWeight: 500,
          fontSize: '0.93rem',
          textAlign: 'center',
          lineHeight: 1.1,
          wordBreak: 'break-word'
        }}>{label}</span>
      </div>
    </Link>
  );
};

export default FeatureButton;