import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import ThemeWrapper from './theme';

ReactDOM.render(
  <React.StrictMode>
    <ThemeWrapper>
      <App />
    </ThemeWrapper>
  </React.StrictMode>,
  document.getElementById("root")
);
