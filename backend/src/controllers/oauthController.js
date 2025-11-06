import { query } from '../config/database.js';
import { 
  generateToken, 
  generateRefreshToken,
  successResponse, 
  errorResponse 
} from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';
import axios from 'axios';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Google OAuth Login
export const googleOAuth = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return errorResponse(res, 'Authorization code is required', 400);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${config.FRONTEND_URL}/auth/callback/google`,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenResponse.data;

    // Get user info from Google
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id, email, given_name, family_name, picture } = userInfoResponse.data;

    // Check if user exists
    let userResult = await query(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      ['google', id]
    );

    let user;
    
    if (userResult.rows.length === 0) {
      // Check if email already exists
      const emailCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
      
      if (emailCheck.rows.length > 0) {
        return errorResponse(res, 'Email already registered with another method', 400);
      }

      // Create new user
      userResult = await query(
        `INSERT INTO users (email, first_name, last_name, oauth_provider, oauth_id, avatar_url, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id, email, first_name, last_name, role, plan_id, email_verified, avatar_url`,
        [email, given_name, family_name, 'google', id, picture]
      );
    }

    user = userResult.rows[0];

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]
    );

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, last_login_ip = $1 WHERE id = $2',
      [req.ip, user.id]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
      [user.id, 'oauth_login_google', req.ip, req.headers['user-agent']]
    );

    successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        emailVerified: user.email_verified,
        planId: user.plan_id,
        role: user.role,
        avatarUrl: user.avatar_url
      },
      token,
      refreshToken
    }, 'Login successful');

  } catch (error) {
    logger.error('Google OAuth error:', error);
    return errorResponse(res, 'Google authentication failed', 500);
  }
});

// GitHub OAuth Login
export const githubOAuth = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return errorResponse(res, 'Authorization code is required', 400);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: config.GITHUB_CLIENT_ID,
      client_secret: config.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${config.FRONTEND_URL}/auth/callback/github`
    }, {
      headers: { Accept: 'application/json' }
    });

    const { access_token } = tokenResponse.data;

    // Get user info from GitHub
    const userInfoResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const githubUser = userInfoResponse.data;
    
    // Get primary email
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    const primaryEmail = emailResponse.data.find(e => e.primary)?.email || githubUser.email;

    if (!primaryEmail) {
      return errorResponse(res, 'No email found in GitHub account', 400);
    }

    const nameParts = (githubUser.name || '').split(' ');
    const firstName = nameParts[0] || githubUser.login;
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check if user exists
    let userResult = await query(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      ['github', githubUser.id.toString()]
    );

    let user;
    
    if (userResult.rows.length === 0) {
      // Check if email already exists
      const emailCheck = await query('SELECT id FROM users WHERE email = $1', [primaryEmail]);
      
      if (emailCheck.rows.length > 0) {
        return errorResponse(res, 'Email already registered with another method', 400);
      }

      // Create new user
      userResult = await query(
        `INSERT INTO users (email, first_name, last_name, oauth_provider, oauth_id, avatar_url, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id, email, first_name, last_name, role, plan_id, email_verified, avatar_url`,
        [primaryEmail, firstName, lastName, 'github', githubUser.id.toString(), githubUser.avatar_url]
      );
    }

    user = userResult.rows[0];

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]
    );

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, last_login_ip = $1 WHERE id = $2',
      [req.ip, user.id]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
      [user.id, 'oauth_login_github', req.ip, req.headers['user-agent']]
    );

    successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        emailVerified: user.email_verified,
        planId: user.plan_id,
        role: user.role,
        avatarUrl: user.avatar_url
      },
      token,
      refreshToken
    }, 'Login successful');

  } catch (error) {
    logger.error('GitHub OAuth error:', error);
    return errorResponse(res, 'GitHub authentication failed', 500);
  }
});

// Get OAuth URLs (for frontend to initiate OAuth flow)
export const getOAuthUrls = asyncHandler(async (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${config.FRONTEND_URL}/auth/callback/google&response_type=code&scope=email profile`;
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.GITHUB_CLIENT_ID}&redirect_uri=${config.FRONTEND_URL}/auth/callback/github&scope=user:email`;

  successResponse(res, {
    google: googleAuthUrl,
    github: githubAuthUrl
  });
});
