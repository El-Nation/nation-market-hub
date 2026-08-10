fetch("http://localhost:5000/api/auth/forgot-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "lewisdunk170@gmail.com" })
}).then(res => res.json()).then(console.log).catch(console.error);
