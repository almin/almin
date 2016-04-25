const now = typeof performance !== "undefined"
    ? performance.now.bind(performance)
    : Date.now.bind(Date);
export default now