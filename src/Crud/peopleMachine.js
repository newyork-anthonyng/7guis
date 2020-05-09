import { Machine, assign, spawn } from "xstate";
import personMachine from "./personMachine";
import { save } from "./database";
import createPerson from "./createPerson";

const machine = Machine(
  {
    id: "crud",
    initial: "initializing",
    context: {
      name: "",
      surname: "",
      people: [],
    },
    on: {
      SELECT_USER: {
        actions: ["deselectOtherUsers", "selectUser", "persist"],
      },
    },
    states: {
      initializing: {
        entry: "initializePeople",
        on: {
          "": "ready",
        },
      },
      ready: {
        on: {
          CREATE: {
            actions: ["createPerson", "persist"],
          },
          INPUT_NAME: {
            actions: "cacheName",
          },
          INPUT_SURNAME: {
            actions: "cacheSurname",
          },
        },
      },
    },
  },
  {
    actions: {
      initializePeople: assign({
        people: (context) => {
          return context.people.map((person) => ({
            ...person,
            ref: spawn(personMachine.withContext(person)),
          }));
        },
      }),
      createPerson: assign({
        name: "",
        surname: "",
        people: (context) => {
          // TODO: might want to handle error states
          if (!(context.name && context.surname)) return context.people;

          const newPerson = createPerson(context);

          return [
            ...context.people,
            {
              ...newPerson,
              ref: spawn(personMachine.withContext(newPerson)),
            },
          ];
        },
      }),
      cacheName: assign({ name: (_, event) => event.value }),
      cacheSurname: assign({ surname: (_, event) => event.value }),
      deselectOtherUsers: (context, event) => {
        context.people.forEach((person) => {
          if (event.person.id !== person.id) person.ref.send("UNSELECT");
        });
      },
      selectUser: assign({
        people: (context, event) => {
          return context.people.map((person) => {
            return person.id === event.person.id
              ? { ...person, selected: !person.selected, ref: person.ref }
              : { ...person, selected: false, ref: person.ref };
          });
        },
      }),

      persist: (ctx) => save(ctx.people),
    },
  }
);

export default machine;
