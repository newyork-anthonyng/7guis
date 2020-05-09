const key = "CRUD_LOCAL_STORAGE";

function get() {
  return JSON.parse(localStorage.getItem(key));
}

function save(data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export { get, save };
