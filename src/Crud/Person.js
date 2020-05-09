import React from "react";
import { useService } from "@xstate/react";
import PropTypes from "prop-types";

function Person({ personRef }) {
  const [state, send] = useService(personRef);

  const { name, surname } = state.context;
  const selected = state.matches("selected");

  const handleNameClick = () => send("TOGGLE");

  return (
    <div
      onClick={handleNameClick}
      className={`${selected ? "bg-blue-700" : "bg-white"} select-none`}
    >
      <span className={selected ? "text-white" : "text-black"}>
        {surname}, {name}
      </span>
    </div>
  );
}

Person.propTypes = {
  personRef: PropTypes.object,
};

export default Person;
