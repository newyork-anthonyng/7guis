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
      surnameFilter: "",
    },
    states: {
      initializing: {
        entry: "initializePeople",
        on: {
          "": "ready",
        },
      },
      ready: {
        type: "parallel",
        states: {
          DELETE: {
            initial: "noError",
            states: {
              noError: {},
              error: {
                initial: "empty",
                states: {
                  empty: {},
                },
              },
            },
          },
          CREATE: {
            initial: "noError",
            states: {
              noError: {},
              error: {
                initial: "empty",
                states: {
                  empty: {},
                },
              },
            },
          },
          UPDATE: {
            initial: "noError",
            states: {
              noError: {},
              error: {
                initial: "empty",
                states: {
                  empty: {},
                  noPersonSelected: {},
                },
              },
            },
          },
        },
        on: {
          CREATE: [
            {
              cond: "areNamesEmpty",
              target: "ready.CREATE.error.empty",
            },
            {
              target: "creating",
            },
          ],
          UPDATE: [
            {
              cond: "isNoPersonSelected",
              target: "ready.UPDATE.error.noPersonSelected",
            },
            {
              cond: "areNamesEmpty",
              target: "ready.UPDATE.error.empty",
            },
            { target: "updating" },
          ],
          INPUT_NAME: {
            actions: "cacheName",
            target: [
              "ready.CREATE.noError",
              "ready.DELETE.noError",
              "ready.UPDATE.noError",
            ],
          },
          INPUT_SURNAME: {
            actions: "cacheSurname",
            target: [
              "ready.CREATE.noError",
              "ready.DELETE.noError",
              "ready.UPDATE.noError",
            ],
          },
          INPUT_SURNAME_FILTER: {
            actions: "cacheSurnameFilter",
            target: [
              "ready.CREATE.noError",
              "ready.DELETE.noError",
              "ready.UPDATE.noError",
            ],
          },
          SELECT_PERSON: {
            actions: ["deselectOtherPeople", "selectPerson", "persist"],
            target: ["ready.DELETE.noError", "ready.UPDATE.noError"],
          },
          DELETE: [
            {
              cond: "isNoPersonSelected",
              target: "ready.DELETE.error",
            },
            {
              target: "deleting",
            },
          ],
        },
      },
      creating: {
        entry: ["createPerson", "persist"],
        on: {
          "": "ready",
        },
      },
      updating: {
        entry: ["updatePerson", "persist"],
        on: {
          "": "ready",
        },
      },
      deleting: {
        entry: ["deletePerson", "persist"],
        on: {
          "": "ready",
        },
      },
    },
  },
  {
    guards: {
      isNoPersonSelected: (context) => {
        return !context.people.some((person) => person.selected);
      },
      areNamesEmpty: (context) => !(context.name && context.surname),
    },
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
      cacheSurnameFilter: assign({ surnameFilter: (_, event) => event.value }),
      deselectOtherPeople: (context, event) => {
        context.people.forEach((person) => {
          if (event.person.id !== person.id) person.ref.send("UNSELECT");
        });
      },
      selectPerson: assign({
        people: (context, event) => {
          return context.people.map((person) => {
            return person.id === event.person.id
              ? { ...person, selected: !person.selected, ref: person.ref }
              : { ...person, selected: false, ref: person.ref };
          });
        },
      }),
      deletePerson: assign({
        people: (context) => {
          const deletedPersonIndex = context.people.findIndex(
            (person) => person.selected
          );

          const copiedPeople = context.people.slice();
          copiedPeople.splice(deletedPersonIndex, 1);
          return copiedPeople;
        },
      }),

      updatePerson: assign({
        people: (context) => {
          const copiedPeople = context.people.slice();
          const personToUpdate = copiedPeople.find((person) => person.selected);
          personToUpdate.name = context.name;
          personToUpdate.surname = context.surname;
          personToUpdate.ref.send("UPDATE_NAME", {
            name: personToUpdate.name,
            surname: personToUpdate.surname,
          });

          return copiedPeople;
        },
      }),

      persist: (ctx) => save(ctx.people),
    },
  }
);

export default machine;
