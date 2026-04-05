"use client";

import React from "react";
import Navbar from "./components/Navbar";

function App({ initialPathname = "/" }) {
  return <Navbar initialPathname={initialPathname} />;
}

export default App;
