import mojoauth from 'mojoauth-sdk';
import dotenv from 'dotenv';

dotenv.config();

console.log("MojoAuth Init - API Key present:", !!process.env.MOJOAUTH_API_KEY);

const mojoAuth = mojoauth({
    apiKey: process.env.MOJOAUTH_API_KEY
});

// Fallback if SDK returns nothing (e.g. invalid key or other issue)
if (!mojoAuth) {
    console.error("CRITICAL: MojoAuth SDK returned undefined! Check API Key.");
} else {
    console.log("MojoAuth initialized successfully. Keys:", Object.keys(mojoAuth));
}

export default mojoAuth;
