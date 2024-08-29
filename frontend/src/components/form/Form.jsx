import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios"; // Import axios
import "./form.scss";
import apiClient from "../ApiClient";

const Form = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    address: "",
    email: "",
    number: "",
  });

  const [submissionStatus, setSubmissionStatus] = useState(null); 

  const [errors, setErrors] = useState({});
  const accessToken = localStorage.getItem("accessToken"); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: false,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (!formData[key]) {
        newErrors[key] = true;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const accessToken = localStorage.getItem("accessToken"); // Get the token from localStorage
    try {
    
        const response = await apiClient.post(
          "/users/", // Use relative endpoint
          {
          f_name: formData.firstname,
          l_name: formData.lastname,
          address: formData.address,
          email_id: formData.email,
          phone_number: formData.number,
        },
        // {
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${accessToken}`, // Include access token in request headers
        //   },
        // }
      );

      if (response.status === 201) {
        console.log("User data submitted successfully");
        setSubmissionStatus("success");
        handleReset(); // Clear form data
      } else if (response.status === 401) {
        alert("Token expired. Please authorize again.");
        localStorage.removeItem("accessToken");
        return;
      } else {
        console.error("Failed to submit user data");
        alert("Failed to submit user data. Please try again.");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Token expired. Please authorize again.");
        localStorage.removeItem("accessToken");
      } else {
        console.error("Error submitting form:", error);
        alert("An error occurred. Please try again.");
      }
    }

  };


 
  const handleReset = () => {
    setFormData({
      firstname: "",
      lastname: "",
      address: "",
      email: "",
      number: "",
    });
    setErrors({});
  };

  const handleReEnter = () => {
    setSubmissionStatus(null); // Show the form again
  };

  const handleFetchList = () => {
    navigate("/list"); 

  };

  const getInputClassName = (baseClassName, fieldName) => {
    return `${baseClassName} ${errors[fieldName] ? 'error' : ''}`;
  };

  return (
   
    <div className="form">
    {submissionStatus === "success" ? (
      <div className="success-screen">
        <h1 className="hsuccess">User Details Noted</h1>
        <div className="button-group">
          <button onClick={handleReEnter}>Create Another</button>
          <button onClick={handleFetchList}>Fetch List</button>
        </div>
      </div>
    ) : (
      <div className="formdiv">
        <form onSubmit={handleSubmit}>
          <div className="username">
            <input
              type="text"
              className={getInputClassName('name', 'firstname')}
              placeholder="First Name"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
            />
            <input
              type="text"
              className={getInputClassName('name', 'lastname')}
              placeholder="Last Name"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
            />
          </div>
          <div className="address">
            <textarea
              name="address"
              value={formData.address}
              className={getInputClassName('useraddress', 'address')}
              cols="30"
              placeholder="Address"
              rows="10"
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="contact">
            <input
              className={getInputClassName('usercontact', 'email')}
              type="email"
              placeholder="email@provider.com"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="number"
              className={getInputClassName('usercontact', 'number')}
              placeholder="Contact Number"
              name="number"
              value={formData.number}
              onChange={handleChange}
            />
          </div>
          <div className="submitdiv">
            <button type="reset" onClick={handleReset}>Reset</button>
            <button type="submit">Send Message</button>
          </div>
        </form>
      </div>
    )}
  </div>
  );
};

export default Form;