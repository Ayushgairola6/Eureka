//checks the validity of strings
export function CheckPresenceAndStringValidity(input) {
  if (!input && typeof input !== "string") {
    return false;
  }
  return true;
}

//checks the validity of arrays
export function CheckPresenceAndArrayValidity(array) {
  if (!array || !Array.isArray(array)) {
    return false;
  }
  return true;
}
