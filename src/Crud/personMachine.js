import { Machine, sendParent } from "xstate";

const personMachine = Machine({
  id: "person",
  initial: "unselected",
  context: {
    id: undefined,
    name: "",
    surname: "",
  },
  states: {
    unselected: {
      on: {
        TOGGLE: {
          target: "selected",
          actions: [
            sendParent((context) => {
              return { type: "SELECT_USER", person: context };
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
              return { type: "SELECT_USER", person: context };
            }),
          ],
        },
        UNSELECT: {
          target: "unselected",
          actions: [
            (context) => {
              console.log(`${context.name} is being unselected`);
            },
          ],
        },
      },
    },
  },
});

export default personMachine;
