// This is a higher-order function that takes an async function
// and returns a new function that handles promise rejections
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
               .catch((err) => next(err)); // Pass errors to the 'next' middleware
    };
};

module.exports = asyncHandler;