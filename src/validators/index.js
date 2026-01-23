import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is required")
            .isLowercase("Username must be in lowercase")
            .isLength({min: 3})
            .withMessage("userName must be at least 3 characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
        body("fullName")
            .optional()
            .trim()
    ];
};

//"Check the 'email' field. If the user didn't send an email, that's fine—skip this check.(isOptional because if the user wants to login with username)
//But if they did send an email, make sure it is a valid email format. If it isn't, return the error: 'Email is invalid'."
const userLoginValidator = () =>{
    return [
        body("email")
        .optional()
        .isEmail()
        .withMessage("Email is invalid"),

        body("password")
        .notEmpty()
        .withMessage("passoword is required"),
    ];
       
};

const userChangeCurrentPasswordValidator = () =>
{
    return [  // return a simple array
      body("oldPassword").notEmpty().withMessage("Old password is required"),
      body("newPassword").notEmpty().withMessage("New password is required"),
    ];
};

const userForgotPasswordValidator = () =>
{
  //when a user forgets thr password he will just send us the email
  return[
    body("email")
     .notEmpty()
     .withMessage("Email is required")
     .isEmail() //check if correct if not respond with message below
     .withMessage("Email is invalid"),
  ];
};   

const userResetForgotPasswordValidator = () =>
{
  return[
    body("newPassword")
     .notEmpty()
     .withMessage("Password is required")     
  ];
};

export
   { 
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
   };