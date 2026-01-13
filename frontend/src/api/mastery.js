import API from "./axios";

export const getMasterySets = async (subjectId, classId) => {
    const response = await API.get(`/mastery/sets`, {
        params: { subjectId, classId }
    });
    return response.data;
};

export const getMasterySetById = async (id) => {
    const response = await API.get(`/mastery/set/${id}`);
    return response.data;
};

export const updateCardStatus = async (setId, cardIndex, status) => {
    const response = await API.post(`/mastery/set/${setId}/status`, {
        cardIndex,
        status
    });
    return response.data;
};

export const updateMatchTime = async (setId, time) => {
    const response = await API.post(`/mastery/set/${setId}/match`, {
        time
    });
    return response.data;
};

export const generateCards = async (data) => {
    const response = await API.post(`/mastery/generate`, data);
    return response.data;
};

export const createMasterySet = async (data) => {
    const response = await API.post(`/mastery/create`, data);
    return response.data;
};
