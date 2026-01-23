import {ApiResponse} from "../utils/api-response.js";
import {asyncHandler} from "../utils/async-handler.js";
/**
This is from lec 121.

const healthCheck = async(req , res, next) => {
    try {
        const user = await getUserFromDB()
        res
        res.status(200).json(
            new ApiResponse(200 , {message: "Server is running"}));
    } catch (error) {
        next(err)
    }
      
};

*/

const healthCheck = asyncHandler(async(requestAnimationFrame,res)=>{
    res.status(200).json(new ApiResponse(200 , {message :
        "Server is running" }))
});

export { healthCheck };