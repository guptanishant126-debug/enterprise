import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { supabaseAdmin } from '../config/supabase.js';
import { logAuditEvent } from '../services/auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusai-enterprise-jwt-super-secret-key-2026';

export const register = async (req, res) => {
  try {
    const { email, password, full_name, department, role } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check if email already registered in database
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An enterprise account with this email address already exists.'
      });
    }

    // Hash password with 12 rounds of bcrypt
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, full_name, department, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, department, role, created_at`,
      [normalizedEmail, password_hash, full_name.trim(), department, role]
    );

    const newUser = rows[0];

    // Synchronize to Supabase Auth Admin if active (non-blocking)
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: newUser.full_name,
            department: newUser.department,
            role: newUser.role
          }
        });
      } catch (sbErr) {
        // Non-blocking notice (e.g. if already registered or network limit)
        console.warn('[AuthController.register] Notice on Supabase Auth sync:', sbErr.message);
      }
    }

    // Generate JWT (8 hours expiration)
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, department: newUser.department },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Audit log
    await logAuditEvent({
      actorId: newUser.id,
      actionType: 'USER_REGISTERED',
      entityType: 'User',
      entityId: newUser.id,
      metadata: { department: newUser.department, role: newUser.role },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Enterprise account created successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('[AuthController.register] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during user registration',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const { rows } = await db.query(
      'SELECT id, email, password_hash, full_name, department, role, created_at FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid enterprise credentials provided.'
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid enterprise credentials provided.'
      });
    }

    // Generate JWT (8 hours)
    const token = jwt.sign(
      { userId: user.id, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const userProfile = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      department: user.department,
      role: user.role,
      created_at: user.created_at
    };

    // Audit log
    await logAuditEvent({
      actorId: user.id,
      actionType: 'USER_LOGGED_IN',
      entityType: 'User',
      entityId: user.id,
      metadata: { department: user.department, role: user.role },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Authenticated successfully',
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('[AuthController.login] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during authentication',
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};
