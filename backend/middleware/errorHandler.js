export const errorHandler = (error, request, reply) => {
  const statusCode = error.statusCode || 500;
  
  console.error('Error:', error);
  
  reply.status(statusCode).send({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFound = (request, reply) => {
  reply.status(404).send({
    success: false,
    message: 'Route not found'
  });
};
