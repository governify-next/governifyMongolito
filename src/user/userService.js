import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usersFilePath = path.resolve(__dirname, 'users.json');

let users = [];
try {
	// load initial users into memory
	const data = fs.readFileSync(usersFilePath, 'utf8');
	users = JSON.parse(data);
} catch (error) {
	console.error('Error reading users file:', error);
}

// Roles and permissions removed. Only validate incoming .role at creation if present.
const ALLOWED_ROLES = ['admin', 'owner', 'member'];

// Helper: return deep copy of users (simulated DB read)
function getUsersCopyFromDB() {
	return JSON.parse(JSON.stringify(users));
}

// Get all users (copy)
function getAllUsers() {
	return getUsersCopyFromDB();
}

// Get user by id
function getUserById(id) {
	return users.find(u => u.id === id) || null;
}

// Create user (no password hashing here: demo only)
function createUser(userPayload) {
	// basic validations
	if (!userPayload || !userPayload.username || !userPayload.email) {
		return { error: 'username and email are required' };
	}
	if (users.find(u => u.username === userPayload.username)) {
		return { error: 'username already exists' };
	}
	if (users.find(u => u.email === userPayload.email)) {
		return { error: 'email already exists' };
	}

	// If role is provided, validate it. Otherwise do not add any role to user.
	if (Object.prototype.hasOwnProperty.call(userPayload, 'role')) {
		if (typeof userPayload.role !== 'string' || !ALLOWED_ROLES.includes(userPayload.role)) {
			return { error: `role must be one of: ${ALLOWED_ROLES.join(', ')}` };
		}
	}

	const newUser = {
		id: userPayload.id,
		username: userPayload.username,
		email: userPayload.email,
		password: userPayload.password || '',
		name: userPayload.name || '',
		surname: userPayload.surname || ''
	};
	// only persist role if it was explicitly provided and valid
	if (Object.prototype.hasOwnProperty.call(userPayload, 'role')) {
		newUser.role = userPayload.role;
	}

	users.push(newUser);
	return newUser;
}

// Exported API for controllers
export default {
	getAllUsers,
	getUserById,
	createUser
};