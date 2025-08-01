import { loginUser as authLoginUser } from './auth';

export const loginUser = async (email, password) => {
    try {
        // Use the loginUser function from auth.js
        const response = await authLoginUser(email, password);
        return response;
    } catch (error) {
        // Re-throw the error with the same structure
        throw error;
    }
};
