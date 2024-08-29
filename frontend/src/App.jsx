import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  BrowserRouter,
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Main from "./components/main/Main";
import Form from "./components/form/Form";
import List from "./components/List/List";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/form" element={<Form />} />
          <Route path="/list" element={<List />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
