import React, { useState, useEffect } from "react";
import axios from "axios";
import "./list.scss";
import apiClient from "../ApiClient";

const List = () => {
  const [users, setUsers] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  
  //added
  const [sortOrder, setSortOrder] = useState("asc"); // New state for sorting order

  const fetchUsers = async (endpoint) => {
    try {
    //   const response = await axios.get(url, {
    //     headers: {
    //       Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    //     },
    //   });
    const response = await apiClient.get(endpoint);

      console.log("API Response:", response.data); // Debugging line to check API response
      if (response.data) {
        setUsers(response.data.users || []); // Set users to response data or an empty array
        setNextUrl(response.data.next_url);
        setPrevUrl(response.data.prev_url);
      } else {
        setUsers([]); // Fallback to an empty array if response data is undefined
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response && error.response.status === 401) {
        navigate("/"); // Navigate back to the home page for re-authorization
      } else {
        setUsers([]); // Fallback to an empty array in case of an error
      }
    }
  };

  useEffect(() => {
    // const url = `http://127.0.0.1:8000/users/?page=${page}&per_page=${perPage}`;
    // const url = `http://127.0.0.1:8000/users/?page=${page}&per_page=${perPage}&sort_order=${sortOrder}`;
    // fetchUsers(url);
    const endpoint = `/users/?page=${page}&per_page=${perPage}&sort_order=${sortOrder}`;
    fetchUsers(endpoint);
  }, [page, perPage, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === "asc" ? "desc" : "asc");
  };


  return (
    <div className="list">
      <div className="sort-controls">
        <button onClick={toggleSortOrder} className="sort-toggle">
          Sort by Created Date: {sortOrder === "asc" ? "Ascending ▲" : "Descending ▼"}
        </button>
      </div>

      <div className="tablediv">
        <table className="table">
          <thead className="tablehead">
            <tr className="tablerow">
              {/* <th className="idhead">ID</th> */}
              <th className="fnamehead">First Name</th>
              <th className="lnamehead">Last Name</th>
              <th className="emailhead">Email</th>
              <th className="phonehead">Phone</th>
              <th className="addreshead">Address</th>
              {/* <th className="datehead">Created Date</th> */}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                {/* <td className="idfield">{user.id}</td> */}
                <td className="fnamefield">{user.f_name}</td>
                <td className="lnamefield">{user.l_name}</td>
                <td className="emailfield">{user.email_id}</td>
                <td className="phonefield">{user.phone_number}</td>
                <td className="addressfield">{user.address}</td>
                {/* <td className="datefield">
                {new Date(user.created_date).toLocaleString()}
              </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-list">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={!prevUrl}
        >
          Previous
        </button>
        <button onClick={() => setPage((prev) => prev + 1)} disabled={!nextUrl}>
          Next
        </button>
      </div>
    </div>
  );
};

export default List;
