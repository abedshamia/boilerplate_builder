const errorHandler = (err, req, res, next) => {
    if (err.code) {
      res.status(err.code).json({
        status: err.code,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: 500,
        message: err.message,
      });
    }
  };
  
  module.exports = errorHandler;
  