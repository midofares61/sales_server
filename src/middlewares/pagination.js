export const paginationMiddleware = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Validate pagination parameters
  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page number must be greater than 0',
      timestamp: new Date().toISOString()
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100',
      timestamp: new Date().toISOString()
    });
  }

  req.pagination = {
    page,
    limit,
    offset
  };

  next();
};

export const createPaginationMeta = (total, page, limit) => {
  const pages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1
  };
};

