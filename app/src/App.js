import React from "react";
import "./App.css";
import Collection from "./pages/Collection";
import Address from "./pages/Address";
import Home from "./pages/Home";
import { Routes, Route, Link } from "react-router-dom";

const App = () => {
  
  

  return (
    <>
      <div className="topBanner bg-black">
        <div className="menuItem bg-black">NFT Whales Radar</div>
        <div className="menu">
          <Link to="/">
            <div className="menuItem">Home</div>
          </Link>
          <div className="menuItem"
          // href="https://parallaxnetwork.io/"
          >
          Parallax</div>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:collection" element={<Collection />} />
        <Route path="/:collection/:address" element={<Address />} />
      </Routes>
    </>
  );
};

export default App;
