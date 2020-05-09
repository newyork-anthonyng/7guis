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
        actions: [
          (context, event) => {
            context.people.forEach((person) => {
              if (event.person.id !== person.id) person.ref.send("UNSELECT");
            });
          },
          assign({
            people: (context, event) => {
              return context.people.map((person) => {
                return person.id === event.person.id
                  ? { ...person, selected: !person.selected, ref: person.ref }
                  : { ...person, selected: false, ref: person.ref };
              });
            },
          }),
          "persist",
        ],
      },
    },
    states: {
      initializing: {
        entry: assign({
          people: (context) => {
            return context.people.map((person) => ({
              ...person,
              ref: spawn(personMachine.withContext(person)),
            }));
          },
        }),
        on: {
          "": "ready",
        },
      },
      ready: {
        on: {
          CREATE: {
            actions: [
              assign({
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
              "persist",
            ],
          },
          INPUT_NAME: {
            actions: assign({
              name: (_, event) => event.value,
            }),
          },
          INPUT_SURNAME: {
            actions: assign({
              surname: (_, event) => event.value,
            }),
          },
        },
      },
    },
  },
  {
    actions: {
      persist: (ctx) => save(ctx.people),
    },
  }
);

export default machine;
