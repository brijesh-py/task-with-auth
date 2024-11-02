const generateUniqueCode = (len = 6) => {
  const chars = "1234567890";
  let id = "";
  for (let i = 0; i < len; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

export default generateUniqueCode;
