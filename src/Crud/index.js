import React from "react";
import { useMachine } from "@xstate/react";
import machine from "./peopleMachine";
import Person from "./Person";
import { get } from "./database";

const initialContext = (() => {
  try {
    return get() || [];
  } catch (e) {
    return [];
  }
})();
const preloadedMachine = machine.withConfig({}, { people: initialContext });

function Crud() {
  const [state, send] = useMachine(preloadedMachine);
  const { name, surname, people } = state.context;

  const handleNameChange = (e) =>
    send({ type: "INPUT_NAME", value: e.target.value });

  const handleSurnameChange = (e) =>
    send({ type: "INPUT_SURNAME", value: e.target.value });

  const handleCreateClick = () => send({ type: "CREATE" });

  const handleDeleteClick = () => send({ type: "DELETE" });

  return (
    <div>
      <label className="block">
        Name
        <input
          className="border-solid border-2 border-gray-100"
          type="text"
          onChange={handleNameChange}
          value={name}
        />
      </label>

      <label className="block">
        Surname
        <input
          className="border-solid border-2 border-gray-100"
          type="text"
          onChange={handleSurnameChange}
          value={surname}
        />
      </label>
      <button
        className="border-solid border-2 border-gray-100 rounded px-4 py-2"
        onClick={handleCreateClick}
      >
        Create
      </button>
      <button
        className="border-solid border-2 border-gray-100 rounded px-4 py-2 bg-red-600 text-white"
        onClick={handleDeleteClick}
      >
        Delete
      </button>

      <div className="text-red-800">
        {state.matches("ready.CREATE.error.empty") &&
          "Name and surname cannot be blank"}
        {state.matches("ready.DELETE.error.empty") && "Select a user to delete"}
      </div>

      <ul>
        {people.map((person) => (
          <li key={person.id}>
            <Person personRef={person.ref} />
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

export default Crud;
