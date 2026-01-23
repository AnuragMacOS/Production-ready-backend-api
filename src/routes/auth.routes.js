import { Router } from "express";
import { changeCurrentPassword, forgotPassowordRequest, login, logoutUser, refreshAccesToken, registerUser, resendEmailVerification, resetForgotpassword, verifyEmail,getCurrentUser } from "../controllers/auth.controllers.js"
import { validate } from "../middlewares/validator.middleware.js";
import { userChangeCurrentPasswordValidator, userForgotPasswordValidator, userLoginValidator, userRegisterValidator, userResetForgotPasswordValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//userRegisterValidator--> We collect all the errors ,
// And pass it to the middleware--->validate (If it is okay then it's fine and if it's not it will throw an error.) 
//And the request reaches to --> RegisterUser.  (That's why we were using "next" function in our middleware. )
//Now all the errors are being controlled by Mongoose and as well as Express Validator, But before it reaches to the Mongoose, we are capturing it and working with it. Basically with Express Validator.  

// unsecured route
router.route("/register").post(userRegisterValidator(),
validate,registerUser);
router.route("/login").post(userLoginValidator(), validate,login);

router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/refresh-token").post(refreshAccesToken);
router
    .route("/forgot-password")
    .post(userForgotPasswordValidator,validate, forgotPassowordRequest);
router
    .route("/reset-password/:resetToken")
    .post(userResetForgotPasswordValidator,validate,resetForgotpassword);


//secure route
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").post(verifyJWT , getCurrentUser);

router.route("/change-password ").post(verifyJWT,
    userChangeCurrentPasswordValidator(),validate,changeCurrentPassword);    

router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification);


export default router;
