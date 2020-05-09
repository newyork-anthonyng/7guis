import { uuid } from "uuidv4";

function createPerson({ name, surname }) {
  return {
    id: uuid(),
    name: name.trim(),
    surname: surname.trim(),
    selected: false,
  };
}

export default createPerson;
