import React from "react";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";

const machine = Machine({
  initial: "running",
  context: {
    elapsed: 0,
    duration: 5,
    interval: 0.1,
  },
  states: {
    running: {
      invoke: {
        src: (context) => (cb) => {
          const interval = setInterval(() => {
            cb("TICK");
          }, 1000 * context.interval);

          return () => clearInterval(interval);
        },
      },
      on: {
        "": {
          target: "paused",
          cond: (context) => {
            return context.elapsed >= context.duration;
          },
        },
        TICK: {
          actions: assign({
            elapsed: (context) =>
              +(context.elapsed + context.interval).toFixed(2),
          }),
        },
      },
    },
    paused: {
      on: {
        "": {
          target: "running",
          cond: (context) => context.elapsed < context.duration,
        },
      },
    },
  },
  on: {
    "DURATION.UPDATE": {
      actions: assign({
        duration: (_, event) => event.value,
      }),
    },
    RESET: {
      actions: assign({
        elapsed: 0,
      }),
    },
  },
});

function Timer() {
  const [current, send] = useMachine(machine);
  const handleSliderChange = (e) => {
    send({ type: "DURATION.UPDATE", value: e.target.value });
  };
  const handleResetClick = () => {
    send({ type: "RESET" });
  };

  return (
    <div>
      <div>
        {current.context.elapsed} / {current.context.duration}
      </div>

      <div className="block">
        <label>
          Change duration:
          <input
            type="range"
            onChange={handleSliderChange}
            min={2}
            max={10}
            value={current.context.duration}
          />
        </label>
      </div>

      <button
        className="border-solid border-4 border-gray-600"
        onClick={handleResetClick}
      >
        Reset
      </button>
    </div>
  );
}

export default Timer;
