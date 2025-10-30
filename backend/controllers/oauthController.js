import axios from 'axios';
import pool from '../config/database.js';
import { hashToken } from '../utils/crypto.js';

// Google OAuth
export const googleAuth = async (request, reply) => {
  const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email`;
  reply.redirect(redirectUri);
};

export const googleCallback = async (request, reply) => {
  const { code } = request.query;

  if (!code) {
    return reply.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { email, name, picture, id } = userResponse.data;

    // Check if user exists
    let result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    let userId;

    if (result.rows.length === 0) {
      // Create new user
      const newUser = await pool.query(
        `INSERT INTO users (email, name, avatar, oauth_provider, oauth_id, is_verified, plan_id) 
         VALUES ($1, $2, $3, $4, $5, true, 1) 
         RETURNING id`,
        [email, name, picture, 'google', id]
      );
      userId = newUser.rows[0].id;
    } else {
      userId = result.rows[0].id;
      // Update OAuth info if not set
      await pool.query(
        'UPDATE users SET oauth_provider = $1, oauth_id = $2, avatar = $3, is_verified = true WHERE id = $4',
        ['google', id, picture, userId]
      );
    }

    // Generate JWT
    const token = request.server.jwt.sign(
      { userId, email },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Store session
    const tokenHash = hashToken(token);
    await pool.query(
      `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
      [userId, tokenHash, request.ip, request.headers['user-agent']]
    );

    reply.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    reply.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// GitHub OAuth
export const githubAuth = async (request, reply) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=user:email`;
  reply.redirect(redirectUri);
};

export const githubCallback = async (request, reply) => {
  const { code } = request.query;

  if (!code) {
    return reply.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { login, name, avatar_url, id } = userResponse.data;

    // Get user email
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const primaryEmail = emailResponse.data.find(e => e.primary)?.email;

    if (!primaryEmail) {
      return reply.redirect(`${process.env.CLIENT_URL}/login?error=no_email`);
    }

    // Check if user exists
    let result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [primaryEmail]
    );

    let userId;

    if (result.rows.length === 0) {
      // Create new user
      const newUser = await pool.query(
        `INSERT INTO users (email, name, avatar, oauth_provider, oauth_id, is_verified, plan_id) 
         VALUES ($1, $2, $3, $4, $5, true, 1) 
         RETURNING id`,
        [primaryEmail, name || login, avatar_url, 'github', id.toString()]
      );
      userId = newUser.rows[0].id;
    } else {
      userId = result.rows[0].id;
      // Update OAuth info if not set
      await pool.query(
        'UPDATE users SET oauth_provider = $1, oauth_id = $2, avatar = $3, is_verified = true WHERE id = $4',
        ['github', id.toString(), avatar_url, userId]
      );
    }

    // Generate JWT
    const token = request.server.jwt.sign(
      { userId, email: primaryEmail },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Store session
    const tokenHash = hashToken(token);
    await pool.query(
      `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
      [userId, tokenHash, request.ip, request.headers['user-agent']]
    );

    reply.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    reply.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};
