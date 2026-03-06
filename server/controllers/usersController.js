// controllers/usersController.js — Profile management logic
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'postpal_secret_key';

// PUT /api/users/profile — Update user profile
async function updateProfile(req, res) {
    const { username, email } = req.body;
    const userId = req.user.id;
    let profilePicture = null;

    if (req.file) {
        // req.file is populated by multer
        profilePicture = req.file.filename;
    }

    if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required.' });
    }

    try {
        // 1. Check if the username or email is already taken by ANOTHER user
        const [existing] = await db.query(
            'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, userId]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Username or email already in use.' });
        }

        // 2. Perform the update
        let query = 'UPDATE users SET username = ?, email = ?';
        let params = [username, email];

        if (profilePicture) {
            query += ', profile_picture = ?';
            params.push(profilePicture);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        await db.query(query, params);

        // 3. Fetch the updated user data to return
        const [rows] = await db.query('SELECT id, username, email, role, profile_picture FROM users WHERE id = ?', [userId]);
        const updatedUser = rows[0];

        // 4. Generate a new JWT token with updated info (important for client-side state)
        const token = jwt.sign(
            {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                profile_picture: updatedUser.profile_picture
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Profile updated successfully!',
            user: updatedUser,
            token
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
}

module.exports = { updateProfile };
