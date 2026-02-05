import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const analyzeUser = async (username) => {
    const response = await api.post('/analyze-user', {
        github_username: username,
    });
    return response.data;
};

export const getSkillProfile = async (username) => {
    const response = await api.get(`/skill-profile/${username}`);
    return response.data;
};

export const recommendRepos = async (username, options = {}) => {
    const response = await api.post('/recommend-repos', {
        github_username: username,
        limit: options.limit || 10,
        min_stars: options.min_stars || 10,  // Lowered from 100 to 10
        languages: options.languages || null,
        exclude_repos: options.exclude_repos || null,
    });
    return response.data;
};

export const recommendIssues = async (username, options = {}) => {
    const response = await api.post('/recommend-issues', {
        github_username: username,
        limit: options.limit || 20,
        difficulty: options.difficulty || 'beginner',
        labels: options.labels || null,
    });
    return response.data;
};

export const recommendFiles = async (username, repository, options = {}) => {
    const response = await api.post('/recommend-files', {
        github_username: username,
        repository: repository,
        limit: options.limit || 10,
        branch: options.branch || 'main',
    });
    return response.data;
};

export default api;
