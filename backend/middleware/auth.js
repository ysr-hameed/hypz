export const authenticate = async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
};

export const adminAuth = async (request, reply) => {
  const adminPassword = request.headers['x-admin-password'];
  
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    reply.status(403).send({ 
      success: false, 
      message: 'Admin authentication failed' 
    });
  }
};

export const optionalAuth = async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    // Continue without authentication
    request.user = null;
  }
};
