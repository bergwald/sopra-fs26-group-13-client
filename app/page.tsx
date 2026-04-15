"use client";

import Link from "next/link";
import React from "react";

const homepageLinksStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const HomePage: React.FC = () => {
  return (
    <div className="login-container">
      <div style={homepageLinksStyle}>
        <div>Homepage</div>
        <Link href="/game/demo">Game demo</Link>
      </div>
    </div>
  );
};

export default HomePage;
