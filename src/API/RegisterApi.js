import { registerUser as authRegisterUser } from './auth';

export const registerUser = async (userData) => {
    try {
        // Use the registerUser function from auth.js
        const response = await authRegisterUser(userData);
        return response;
    } catch (error) {
        // Re-throw the error with the same structure
        throw error;
    }
};
