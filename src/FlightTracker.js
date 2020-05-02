import React from "react";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";

const dateRegex = /^(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
function isValidDate(dateString) {
  return dateRegex.test(dateString);
}

const machine = Machine(
  {
    id: "flightTracker",
    initial: "ready",
    context: {
      startDate: "1/1/2020",
      endDate: "1/2/2020",
      tripType: "oneWay",
    },
    states: {
      ready: {
        type: "parallel",
        on: {
          INPUT_START_DATE: [
            {
              actions: ["cacheStartDate"],
              target: ["ready.startDate.noError", "ready.api.noError"],
            },
          ],
          INPUT_END_DATE: [
            {
              actions: ["cacheEndDate"],
              target: ["ready.endDate.noError", "ready.api.noError"],
            },
          ],
          SUBMIT: [
            {
              cond: "areDatesValid",
              target: "waitingResponse",
            },
            {
              target: "ready.endDate.error.invalidRoundTrip",
            },
          ],
          CHANGE_TRIP_TYPE: [{ actions: ["cacheTripType"] }],
          VALIDATE_START_DATE: {
            cond: "isStartDateInvalid",
            target: "ready.startDate.error",
          },
          VALIDATE_END_DATE: {
            cond: "isEndDateInvalid",
            target: "ready.endDate.error",
          },
        },
        states: {
          startDate: {
            initial: "noError",
            states: {
              noError: {},
              error: {
                initial: "invalidFormat",
                states: {
                  invalidFormat: {},
                },
              },
            },
          },
          endDate: {
            initial: "noError",
            states: {
              noError: {},
              error: {
                initial: "invalidFormat",
                states: {
                  invalidFormat: {},
                  invalidRoundTrip: {},
                },
              },
            },
          },
          api: {
            initial: "noError",
            states: {
              noError: {},
              error: {},
            },
          },
          button: {
            initial: "noError",
            states: {
              noError: {},
              error: {},
            },
          },
        },
      },
      waitingResponse: {
        invoke: {
          src: "requestFlightInfo",
          onDone: {
            actions: "onSuccess",
            target: "success",
          },
          onError: {
            target: "ready.api.error",
          },
        },
      },
      success: {
        type: "final",
      },
    },
  },
  {
    services: {
      requestFlightInfo: () => {
        return new Promise((resolve) => {
          // Mock request
          setTimeout(resolve, 1500);
        });
      },
    },
    guards: {
      isStartDateInvalid: (context) => {
        const result = isValidDate(context.startDate);
        return !result;
      },
      isEndDateInvalid: (context) => {
        const result = isValidDate(context.endDate);
        return !result;
      },
      areDatesValid: (context) => {
        if (context.tripType === "oneWay") {
          return isValidDate(context.startDate);
        } else if (context.tripType === "roundTrip") {
          if (
            !(isValidDate(context.startDate) && isValidDate(context.endDate))
          ) {
            return false;
          }

          const startDate = new Date(context.startDate);
          const endDate = new Date(context.endDate);

          return startDate < endDate;
        }

        return false;
      },
    },
    actions: {
      cacheStartDate: assign({
        startDate: (_, event) => event.value,
      }),
      cacheEndDate: assign({
        endDate: (_, event) => event.value,
      }),
      cacheTripType: assign({
        tripType: (_, event) => event.value,
      }),
    },
  }
);

function FlightTracker() {
  const [current, send] = useMachine(machine);
  const handleSelectChange = (e) => {
    send({ type: "CHANGE_TRIP_TYPE", value: e.target.value });
  };
  const handleStartDateChange = (e) => {
    send({ type: "INPUT_START_DATE", value: e.target.value });
  };
  const handleStartDateBlur = () => {
    send({ type: "VALIDATE_START_DATE" });
  };
  const handleEndDateChange = (e) => {
    send({ type: "INPUT_END_DATE", value: e.target.value });
  };
  const handleEndDateBlur = () => {
    send({ type: "VALIDATE_END_DATE" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send({ type: "SUBMIT" });
  };

  if (current.matches("success")) {
    return <h1>Flight found</h1>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <select
            onChange={handleSelectChange}
            value={current.context.tripType}
          >
            <option value="oneWay">One Way</option>
            <option value="roundTrip">Round Trip</option>
          </select>
        </div>

        <div>
          <label>
            Start date
            <input
              type="text"
              onChange={handleStartDateChange}
              value={current.context.startDate}
              onBlur={handleStartDateBlur}
            />
          </label>

          <div className="text-red-600">
            {current.matches("ready.startDate.error.invalidFormat") &&
              "Start date should be mm/dd/yyyy format"}
          </div>
        </div>

        <div>
          <label>
            End date
            <input
              type="text"
              className="disabled:opacity-25"
              onChange={handleEndDateChange}
              value={current.context.endDate}
              onBlur={handleEndDateBlur}
              disabled={current.context.tripType === "oneWay"}
            />
            <div className="text-red-600">
              {current.matches("ready.endDate.error.invalidFormat") &&
                "End date should be mm/dd/yyyy format"}
              {current.matches("ready.endDate.error.invalidRoundTrip") &&
                "End date should be after start date"}
            </div>
          </label>
        </div>

        {current.matches("waitingResponse") ? (
          <p>Loading response...</p>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Browse
          </button>
        )}

        {current.matches("ready.api.error") && (
          <p className="text-red-600">
            There was an issue finding a flight. Try again
          </p>
        )}
      </form>
    </div>
  );
}
export default FlightTracker;
