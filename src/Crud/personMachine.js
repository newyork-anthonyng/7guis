import { Machine, sendParent } from "xstate";

const personMachine = Machine({
  id: "person",
  initial: "initializing",
  context: {
    id: undefined,
    name: "",
    surname: "",
  },
  states: {
    initializing: {
      on: {
        "": [
          {
            cond: (context) => context.selected,
            target: "selected",
          },
          "unselected",
        ],
      },
    },
    unselected: {
      on: {
        TOGGLE: {
          target: "selected",
          actions: [
            sendParent((context) => {
              return { type: "SELECT_PERSON", person: context };
            }),
          ],
        },
      },
    },
    selected: {
      on: {
        TOGGLE: {
          target: "unselected",
          actions: [
            sendParent((context) => {
              return { type: "SELECT_PERSON", person: context };
            }),
          ],
        },
        UNSELECT: {
          target: "unselected",
        },
      },
    },
  },
});

export default personMachine;
