import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, forgotPasswordnMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";


//------ generate access token and refresh token------

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // the refresh token that we generated is going in the database.
    await user.save({ validateBeforeSave: false }); //before saving dont do the validatebeforeSave, turn it off , i know what i am doing
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token",
    );
  }
};

//------ Lets write a method for registering a user------
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  //if user exists i dont wanna proceed, i wanna respond with error msg
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }
  // & if we dont find the user in the database we will put it in db.

  const user = await User.create({
    // now all userschemas can only be accesed by 'user' not 'User' because User is for mongoose model
    email,
    password,
    username,
    isEmailVerified: false,
  });
  
  // so all the functionality that you have written in the models is now available inside "user".
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });
  await sendEmail({

    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      //below code will generate link dynamically

      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });
  // our user has all the data(uname,avatar,rtoken,pw etc) but we dont need to send all these man, only send limited anount of stuff
  //so we will remove the unnecesaary extra data that we used to send by below code.

  const createdUser= await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully and verification email has been sent on your email",
      ),
    );
});

//------ 135. login user with tokens and cookie data ------
const login = asyncHandler(async (req, res) => {
  
  const {email,password,username } = req.body
  if(!email){
    throw new ApiError(400,"Username or emial is required");
  }
  const user = await User.findOne({ email });
  
  if(!user){
    throw new ApiError( 400 , "User doesnot exists");
  }
  
  const isPasswordvalid = await user.isPasswordCorrect(password);
  
  if(!isPasswordvalid){
    throw new ApiError(400, "Invalid credentials");
  }
  
  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);
 
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );
  
  // cookies
  const options ={
    httpOnly : true,
    secure : true
  }
  //once this is done we will need to send the res-->response
  return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    //now cookie is set and now its time to send standard json response
    .json(
      new ApiResponse(
        200,
        {
          user : loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
   )

});
//------ Logout users------
const logoutUser = asyncHandler(async (req, res)=>{
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set : {
          refreshToken: ""
        }
      },
      {
        new: true,
      },
    );
    const options = {
      httpOnly: true,
      secure : true
    }
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(
        new ApiResponse(200, {},"User logged out")
      );
    
});

//------ 139. get current user info(secured)------
const getCurrentUser = asyncHandler( async(req,res) =>{
  return res
     .status(200)
     .json(
        new ApiResponse(
          200,
          req.user,
          "Current user fetched successfully"
       ));
 });

 //------ verifying the email------

const verifyEmail = asyncHandler( async(req,res) =>{
  const { verificationToken} = req.params

  if(!verificationToken){
    throw new ApiError(400, "Email verification token is missing")
  }

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: {$gt: Date.now()}  //gt-->greater than (emailverificationexpiry should be greater than date.now (i.e 20mins) because 20 min was out expiry time that we made in user.model.js --->which tells us that token is valid
    }) 

    if(!user){
     throw new ApiError(400, "Token is expired or invalid")
    }
    //since these two were unnecessary data just sitting there in user.model.js(it optional but we do it)
    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined

   //if token is not expired
    user.isEmailVerified = true
    await user.save({validateBeforeSave: false});
    
    return res 
      .status(200)
      .json(
         new ApiResponse(
           200,
           {
            isEmailVerified: true
           },
           "Email verified"
         ),
       );
})

//------ resend verification email ------

const resendEmailVerification = asyncHandler( async(req,res) =>{
  //resend verification email can only be send by user who is already logged in ,and the user is logged in , then find the user by Id
  const user = await User.findById(req.user?._id);
  
  // and if we dont find the user
  if(!user){
    throw new ApiError(404,"User does not exist")

  }
  //what if user is trying to resend the email but he is alredy verified
  if(user.isEmailVerified){
    throw new ApiError(409, "Email is already verified")
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });
  await sendEmail({

    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      //below code will generate link dynamically

      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });

  return res
   .status(200)
   .json(
    new ApiResponse(
      200,
      {},
      " Mail has been sent to your email ID"
    ),
   );
});

//------ refresh the access token to get the new access token (we can do it based on refreshAccesToken)------

const refreshAccesToken = asyncHandler( async(req,res) =>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
  //if we dont have the incomingrefreshToken , its a problem  

  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized access")
  }
  
  // if we have the incomingrefreshtoken we will try to decode this
  try {
     const decodedToken = jwt.verify(incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET)

     const user = await User.findById(decodedToken?._id);
     
     // if you dont have the user thats a problem
     if(!user){
      throw new ApiError(401, "Invalid refresh Token");
     }

     if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired"); //we dont have it in the DB
     }
     
     // if all after these if(checks) ,everything is good then we can go ahead and generate the tokens
     const options = {
      httpOnly : true,
      secure : true
     }
     
     const { accessToken,refreshToken : newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
     
     //now lets update the DB (the refresh token)
     user.refreshToken = newRefreshToken;
     await user.save();
     //now lets return the response
     return res
        .status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken", newRefreshToken,options)
        //now send the json response
        .json(
          new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "Access token refreshed"
          )
        )
  } catch (error) {
    throw new ApiError(401,"Invalid refresh token")
   }
});

//------- Request password reset-----------------
// Who uses it-->The user who cannot log in. AND Requirement--->Requires a verifier (Email, SMS).
const forgotPassowordRequest = asyncHandler( async(req,res) =>{
  const{email} = req.body   // we receive an email and that comes from the body
  
  //seach User in the Db and put it in user
  const user = await User.findOne({email})

  if(!user){
    throw new ApiError(404,"User does not exist")
  }
  const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken
  user.forgotPasswordExpiry = tokenExpiry

  await user.save({validateBeforeSave: false})
  
  await sendEmail({

    email: user?.email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordnMailgenContent(
      user.username,
      //below code will generate link dynamically

      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  });
  
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail id"
      )
    )

  
});

//--------- Reset forgotten password-------------
// Who uses it-->The user to overwrite the old data. AND Requirement--->Requires a valid token.
const resetForgotpassword = asyncHandler( async(req,res) =>
{
  const { resetToken } = req.params
  const { newPassword } = req.body

  let hashedToken = crypto
     .createHash("shs256")
     .update(resetToken)
     .digest("hex")
     
     //await User is going to find it and put that shi in user
     
     await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: {$gt: Date.now()}
     })
     
     if(!user){
      throw new ApiError(489, "Token is invalid or expired")
     }

     user.forgotPasswordExpiry = undefined
     user.forgotPasswordToken = undefined

     user.password = newPassword
     await user.save ({validateBeforeSave : false})

     return res 
       .status(200)
       .json(
         new ApiResponse(
           200,
           {},
           "Password reset successfully"
          ),
        );
});

//-----------change password-----------
const changeCurrentPassword = asyncHandler( async(req,res) =>
  {
    const { oldPassword ,newPassword} = req.body

    //find the user
    const user = await User.findById(req.user?._id);
    const isPasswordvalid = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordvalid){
       throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
      .status(200)
      .json(
         new ApiResponse(
          200,
          {},
          "Password changed successfully"
         ),
      ); 
  })



 export {
    registerUser,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccesToken,
    forgotPassowordRequest,
    resetForgotpassword,
    changeCurrentPassword,
 
   };
