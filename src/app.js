import React from "react";
import { render } from "react-dom";
import "./styles.css";
import Counter from "./Counter";

function App() {
  return <Counter />;
}

render(<App />, document.querySelector(".js-root"));
