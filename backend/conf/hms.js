
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // v4 is not available, I'll use crypto
import crypto from 'crypto';
import axios from 'axios';

const APP_ACCESS_KEY = process.env.HMS_ACCESS_KEY;
const APP_SECRET = process.env.HMS_SECRET;

export const getManagementToken = () => {
    const payload = {
        access_key: APP_ACCESS_KEY,
        type: 'management',
        version: 2,
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(
        payload,
        APP_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: '24h',
            jwtid: crypto.randomUUID()
        }
    );
};

export const getAuthToken = (roomId, role, userId) => {
    const payload = {
        access_key: APP_ACCESS_KEY,
        room_id: roomId,
        user_id: userId,
        role: role,
        type: 'app',
        version: 2,
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(
        payload,
        APP_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: '24h',
            jwtid: crypto.randomUUID()
        }
    );
};

export const createRoom = async (name, description) => {
    const token = getManagementToken();
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post('https://api.100ms.live/v2/rooms', {
            name: name,
            description: description,
            template_id: '' // Use default or specify if known. Empty usually creates default video conf.
        }, { headers });
        return response.data;
    } catch (error) {
        console.error('Error creating 100ms room:', error.response ? error.response.data : error.message);
        throw error;
    }
};
