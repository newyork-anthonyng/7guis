import React from "react";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";

function convertCelsiusToFahrenheit(celsius) {
  return celsius * (9 / 5) + 32;
}

function convertFahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * (5 / 9);
}

const machine = Machine(
  {
    id: "temperatureConverter",
    initial: "ready",
    context: {
      celsius: 0,
      fahrenheit: convertCelsiusToFahrenheit(0),
    },
    on: {
      INPUT_FAHRENHEIT: [
        {
          actions: "cacheFahrenheit",
        },
      ],
      INPUT_CELSIUS: [
        {
          actions: "cacheCelsius",
        },
      ],
    },
    states: {
      ready: {},
    },
  },
  {
    actions: {
      cacheFahrenheit: assign({
        celsius: (_context, event) => {
          const number = parseInt(event.value || 0);
          return Math.ceil(convertFahrenheitToCelsius(number));
        },
        fahrenheit: (_context, event) => {
          if (event.value === "") return 0;

          return parseInt(event.value);
        },
      }),
      cacheCelsius: assign({
        celsius: (_context, event) => {
          if (event.value === "") return 0;

          return parseInt(event.value);
        },
        fahrenheit: (_context, event) => {
          const number = parseInt(event.value || 0);
          return Math.ceil(convertCelsiusToFahrenheit(number));
        },
      }),
    },
  }
);

function TemperatureConverter() {
  const [current, send] = useMachine(machine);
  const handleCelsiusChange = (e) => {
    send({ type: "INPUT_CELSIUS", value: e.target.value });
  };
  const handleFahrenheitChange = (e) => {
    send({ type: "INPUT_FAHRENHEIT", value: e.target.value });
  };
  return (
    <div>
      <input
        type="text"
        onChange={handleCelsiusChange}
        value={current.context.celsius}
      />{" "}
      Celsius =
      <input
        type="text"
        onChange={handleFahrenheitChange}
        value={current.context.fahrenheit}
      />{" "}
      Fahrenheit
    </div>
  );
}

export default TemperatureConverter;
