//creating wrapper for async function where we are using promises
const asyncHandler = (requestHandler) => {
  return (req,res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
  }
}

export {asyncHandler}


//creating wrapper for async function where we are using try and catch

// export {asyncHandler}

// const asyncHandler = (function) => async  {() => {}}

// const asyncHandler = (fn) => async (req,res,next) => {
//   try {
//     await fn(req, res, next)
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }