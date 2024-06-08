import jwt, { Secret } from 'jsonwebtoken'


export const jwtHelper = async (payload: { userId: number, email: string }, secret: Secret) => {
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });
    return token;
}