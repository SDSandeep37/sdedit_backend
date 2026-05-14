import validate from "validator";

//function for email validation
export function emailValidator(email) {
  return validate.isEmail(email);
}

// Validate name
export function nameValidator(name) {
  if (!name) {
    return false;
  } else {
    const nameRegex = /^[a-zA-Z\s]{2,30}$/;
    return nameRegex.test(name);
  }
}
export function passwordValidator(password) {
  return validate.isStrongPassword(password, {
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
}

// Validate URL
export function urlValidator(url) {
  return validate.isURL(url, {
    protocols: ["http", "https"], // restrict to http/https
    require_protocol: true, // must include protocol
    require_valid_protocol: true, // protocol must be valid
  });
}
