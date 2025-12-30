
const messages = [
    "A new day is a blank page. What will you write?",
    "Every small observation is a step toward understanding.",
    "Be gentle with yourself today.",
    "What is one thing you can do for your well-being right now?",
    "Your journey is unique and valuable.",
    "Notice the quiet moments today.",
    "Rest is a productive act.",
    "Curiosity is the kindest form of attention.",
];

export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

export const getDynamicMessage = (): string => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return messages[dayOfYear % messages.length];
};
