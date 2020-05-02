import React from "react";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";

const machine = Machine(
  {
    id: "counter",
    initial: "ready",
    context: {
      count: 0,
    },
    on: {
      INCREMENT: {
        actions: "INCREASE_COUNT",
      },
    },
    states: {
      ready: {},
    },
  },
  {
    actions: {
      INCREASE_COUNT: assign({
        count: (context) => context.count + 1,
      }),
    },
  }
);

function Counter() {
  const [current, send] = useMachine(machine);
  const handleClick = () => {
    send({ type: "INCREMENT" });
  };
  return (
    <div className="m-10">
      <h1>Counter</h1>
      <span className="block mb-1">{current.context.count}</span>
      <button
        className="border-solid border-2 border-gray-600 rounded-sm px-4 py-1"
        onClick={handleClick}
      >
        Count
      </button>
    </div>
  );
}

export default Counter;
