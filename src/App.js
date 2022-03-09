import "./App.css";
import Sidebar from "./components/Sidebar";
import Content from "./components/Content";
import Header from "./components/Header";
import data from "./assets/data.json";

import { BrowserRouter } from "react-router-dom";
import { parseOwlJsonLd } from "./parsing.js";

const info = parseOwlJsonLd(data);

function App() {
  return (
    <BrowserRouter>
      <Header info={info}></Header>
      <div className="wrapper">
        <Sidebar info={info} />
        <Content info={info} />
      </div>
    </BrowserRouter>
  );
}

export default App;
