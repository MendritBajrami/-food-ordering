const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const register = async (req, res) => {
  try {
    const { name, phone, password, address } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }

    const existingUser = await db.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, phone, password_hash, address) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, address, role, created_at',
      [name, phone, passwordHash, address]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    delete user.password_hash;
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { name, address, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
      const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
      if (!valid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      await db.query(
        'UPDATE users SET name = $1, address = $2, password_hash = $3 WHERE id = $4 RETURNING id, name, phone, address, role',
        [name, address, newHash, userId]
      );
    } else {
      await db.query(
        'UPDATE users SET name = $1, address = $2 WHERE id = $3 RETURNING id, name, phone, address, role',
        [name, address, userId]
      );
    }

    const updated = await db.query('SELECT id, name, phone, address, role FROM users WHERE id = $1', [userId]);
    res.json({ user: updated.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete your account' });
    }

    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, phone, address, role, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const adminAddUser = async (req, res) => {
  try {
    const { name, phone, password, address, role } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }
    const existing = await db.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Phone already exists' });

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, phone, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, address, role, created_at',
      [name, phone, hash, address || null, role || 'customer']
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Admin add user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, name, address, phone } = req.body;
    
    const result = await db.query(
      'UPDATE users SET role = COALESCE($1, role), name = COALESCE($2, name), address = COALESCE($3, address), phone = COALESCE($4, phone) WHERE id = $5 RETURNING id, name, phone, address, role',
      [role, name, address, phone, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === parseInt(id)) return res.status(400).json({ error: 'You cannot delete your own admin account' });
    
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, getMe, updateProfile, deleteAccount, getAllUsers, adminAddUser, adminUpdateUser, adminDeleteUser };