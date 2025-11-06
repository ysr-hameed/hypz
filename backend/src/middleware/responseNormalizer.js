// Middleware to normalize JSON responses to a consistent API shape
// Ensures all responses follow { success: boolean, message?: string, data?: any, errors?: any }

export const responseNormalizer = (req, res, next) => {
  const oldJson = res.json.bind(res);

  res.json = (body) => {
    // If body is already a proper response, pass through
    if (body && typeof body === 'object') {
      const normalized = { ...body };

      // Ensure success is boolean
      if (typeof normalized.success !== 'boolean') {
        // Determine success by HTTP status
        const status = res.statusCode || 200;
        normalized.success = status >= 200 && status < 300;
      }

      // Ensure message exists
      if (!normalized.message) {
        if (normalized.success) normalized.message = 'Success';
        else normalized.message = 'Error occurred';
      }

      // If success true and data is missing but whole body contains payload, move payload to data
      if (normalized.success && normalized.data === undefined) {
        const keys = Object.keys(normalized).filter(k => !['success','message','errors'].includes(k));
        if (keys.length === 1 && keys[0] !== 'data') {
          normalized.data = normalized[keys[0]];
          delete normalized[keys[0]];
        }
      }

      return oldJson(normalized);
    }

    // Non-object responses -> wrap
    return oldJson({ success: true, message: 'Success', data: body });
  };

  next();
};

export default responseNormalizer;
