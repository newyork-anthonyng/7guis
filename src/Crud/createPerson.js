import { uuid } from "uuidv4";

function createPerson({ name, surname }) {
  return {
    id: uuid(),
    name: name,
    surname: surname,
    selected: false,
  };
}

export default createPerson;
