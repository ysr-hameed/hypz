import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

// 1. CREATE BATCH JOB
export const createBatchJob = asyncHandler(async (req, res) => {
  const { bucketId, jobType, filters, priority } = req.body;
  const userId = req.user.id;

  // Verify bucket ownership if specified
  if (bucketId) {
    const bucketResult = await query(
      'SELECT * FROM buckets WHERE id = $1 AND user_id = $2',
      [bucketId, userId]
    );

    if (bucketResult.rows.length === 0) {
      return errorResponse(res, 'Bucket not found', 404);
    }
  }

  // Validate job type
  const validTypes = ['delete', 'copy', 'restore', 'change_storage_class', 'tag'];
  if (!validTypes.includes(jobType)) {
    return errorResponse(res, `Invalid job type. Must be one of: ${validTypes.join(', ')}`, 400);
  }

  const result = await transaction(async (client) => {
    // Create job
    const jobResult = await client.query(
      `INSERT INTO batch_jobs (user_id, bucket_id, job_type, filters, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, bucketId || null, jobType, JSON.stringify(filters || {}), priority || 0, 'pending']
    );

    const job = jobResult.rows[0];

    // Get files matching filters
    let filesQuery = 'SELECT id FROM files WHERE user_id = $1 AND deleted_at IS NULL';
    const params = [userId];

    if (bucketId) {
      filesQuery += ' AND bucket_id = $2';
      params.push(bucketId);
    }

    const filesResult = await client.query(filesQuery, params);

    // Create batch operations for each file
    for (const file of filesResult.rows) {
      await client.query(
        `INSERT INTO batch_operations (job_id, file_id, operation_type, status)
         VALUES ($1, $2, $3, $4)`,
        [job.id, file.id, jobType, 'pending']
      );
    }

    // Update job with total operations
    await client.query(
      'UPDATE batch_jobs SET total_operations = $1 WHERE id = $2',
      [filesResult.rows.length, job.id]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'batch_job_created', 'batch_job', job.id, { jobType, totalOps: filesResult.rows.length }]
    );

    return { ...job, total_operations: filesResult.rows.length };
  });

  successResponse(res, {
    id: result.id,
    jobType: result.job_type,
    status: result.status,
    totalOperations: result.total_operations,
    message: 'Batch job created successfully'
  }, 201);
});

// 2. GET BATCH JOB
export const getBatchJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user.id;

  const result = await query(
    'SELECT * FROM batch_jobs WHERE id = $1 AND user_id = $2',
    [jobId, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Batch job not found', 404);
  }

  const job = result.rows[0];

  successResponse(res, {
    id: job.id,
    jobType: job.job_type,
    status: job.status,
    totalOperations: job.total_operations,
    completedOperations: job.completed_operations,
    failedOperations: job.failed_operations,
    startedAt: job.started_at,
    completedAt: job.completed_at,
    createdAt: job.created_at
  });
});

// 3. LIST BATCH JOBS
export const listBatchJobs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const status = req.query.status;

  let queryStr = 'SELECT * FROM batch_jobs WHERE user_id = $1';
  const params = [userId];

  if (status) {
    queryStr += ' AND status = $2';
    params.push(status);
  }

  queryStr += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await query(queryStr, params);

  successResponse(res, {
    jobs: result.rows.map(j => ({
      id: j.id,
      jobType: j.job_type,
      status: j.status,
      totalOperations: j.total_operations,
      completedOperations: j.completed_operations,
      failedOperations: j.failed_operations,
      createdAt: j.created_at
    })),
    count: result.rows.length,
    limit,
    offset
  });
});

// 4. CANCEL BATCH JOB
export const cancelBatchJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user.id;

  await transaction(async (client) => {
    const result = await client.query(
      `UPDATE batch_jobs 
       SET status = 'cancelled', completed_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'running')
       RETURNING *`,
      [jobId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Batch job not found or cannot be cancelled');
    }

    // Cancel pending operations
    await client.query(
      `UPDATE batch_operations
       SET status = 'cancelled'
       WHERE job_id = $1 AND status = 'pending'`,
      [jobId]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'batch_job_cancelled', 'batch_job', jobId, {}]
    );
  });

  successResponse(res, {
    jobId,
    message: 'Batch job cancelled successfully'
  });
});

// 5. LIST BATCH OPERATIONS
export const listBatchOperations = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  // Verify job ownership
  const jobResult = await query(
    'SELECT id FROM batch_jobs WHERE id = $1 AND user_id = $2',
    [jobId, userId]
  );

  if (jobResult.rows.length === 0) {
    return errorResponse(res, 'Batch job not found', 404);
  }

  const result = await query(
    `SELECT bo.*, f.filename
     FROM batch_operations bo
     LEFT JOIN files f ON bo.file_id = f.id
     WHERE bo.job_id = $1
     ORDER BY bo.created_at ASC
     LIMIT $2 OFFSET $3`,
    [jobId, limit, offset]
  );

  successResponse(res, {
    operations: result.rows.map(op => ({
      id: op.id,
      fileId: op.file_id,
      filename: op.filename,
      operationType: op.operation_type,
      status: op.status,
      errorMessage: op.error_message,
      executedAt: op.executed_at
    })),
    count: result.rows.length,
    limit,
    offset
  });
});
