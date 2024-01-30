const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };

  /* 
 // another method
 Promise.resolve(fn(req,res,next)).catch(next)
   */
};

module.exports = catchAsync;
