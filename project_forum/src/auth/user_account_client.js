const DEFAULT_TIMEOUT_MS = 5000;

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const buildLoginUrl = () => {
    const baseUrl = trimTrailingSlash(process.env.USER_ACCOUNT_BASE_URL);
    if (!baseUrl) {
        throw new Error('USER_ACCOUNT_BASE_URL is not configured');
    }

    return `${baseUrl}/login`;
};

const withTimeout = (timeoutMs = DEFAULT_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return { controller, timer };
};

export const loginViaUserAccount = async (authorizationHeader) => {
    const loginUrl = buildLoginUrl();
    const { controller, timer } = withTimeout();

    try {
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                Authorization: authorizationHeader,
            },
            signal: controller.signal,
        });

        if (response.status === 401) {
            return { authorized: false, user: null };
        }

        if (!response.ok) {
            throw new Error(`UserAccount login request failed with status ${response.status}`);
        }

        const user = await response.json();
        return { authorized: true, user };
    } finally {
        clearTimeout(timer);
    }
};