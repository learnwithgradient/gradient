"use client";

import React from "react";
import Navbar from "./components/Navbar";

function App({ initialPathname = "/", initialAuthStatus = "anonymous" }) {
  return <Navbar initialPathname={initialPathname} initialAuthStatus={initialAuthStatus} />;
}

export default App;
