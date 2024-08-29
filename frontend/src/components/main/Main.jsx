import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./main.scss";
import axios from "axios"; // Import axios
import apiClient from "../ApiClient";

const Main = () => {

  const navigate = useNavigate(); // Initialize useNavigate

  const handleAuthorize = async () => {
    try {

      // const response = await axios.post("http://127.0.0.1:8000/token");
      const response = await apiClient.post("/token"); // Use apiClient to fetch the token
      if (response.status === 200) {
        const { access_token } = response.data;
        localStorage.setItem("accessToken", access_token); // Store token in localStorage
        navigate("/form"); // Navigate to form page
      } else {
        console.error("Failed to fetch access token");
        alert("Authorization failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };
  return (
    <div className="main">
      <div className="top">
        <div className="videodiv">
          <video width="280" autoPlay loop muted>
            <source src="/video/ta.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hdiv">
          <h1>tech active</h1>
        </div>
      </div>
      <div className="bottom">
        <div className="buttondiv">
          <button onClick={handleAuthorize}>Authorize</button>
        </div>
      </div>
    </div>
  );
};

export default Main;
