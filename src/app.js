import React from "react";
import { render } from "react-dom";
import "./styles.css";
import Counter from "./Counter";
import TemperatureConverter from "./TemperatureConverter";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/counter">Counter</Link>
            </li>
            <li>
              <Link to="/temperature-converter">Temperature Converter</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/counter">
            <Counter />
          </Route>
          <Route path="/temperature-converter">
            <TemperatureConverter />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

render(<App />, document.querySelector(".js-root"));
