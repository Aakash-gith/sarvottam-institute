
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // v4 is not available, I'll use crypto
import crypto from 'crypto';
import axios from 'axios';

const APP_ACCESS_KEY = '694c62466a127e1cf1253843';
const APP_SECRET = 'GgwSzObrk3I96MaGcFLJtHhMhr3_t16TcGn6j2Y_SduuWg8dWon77OfFKgbGuVRn5RbEgfP1QhauhfZs3nlBzbX2XwO5VrRkosYPz51zqN9nYbSyUih3J0Gn3N8nvnWg_8xNTHXr4Ee0WjXKpyo0I011fdvvU-7DMG11OJukrD8=';

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
