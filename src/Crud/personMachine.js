import { Machine, assign, sendParent } from "xstate";

const personMachine = Machine({
  id: "person",
  initial: "initializing",
  context: {
    id: undefined,
    name: "",
    surname: "",
  },
  on: {
    UPDATE_NAME: {
      actions: assign({
        name: (_, event) => event.name,
        surname: (_, event) => event.surname,
      }),
    },
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
