export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const id = () => Math.random().toString().replace(".", "");
