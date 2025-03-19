// Login.js
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Login.css'; // Import the CSS file


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      localStorage.setItem("token", res.data.token);
      
      const id = res.data.user.id;
      console.log("type id", typeof id);
      alert("Амжилттай нэвтэрлээ!");
      navigate(`/dashboard/${id}`); // Дашбоард руу шилжүүлэх
    } catch (err) {
      setError(err.response?.data?.message || "Алдаа гарлаа.");
    }
  };

  const handleRegister = () => {
    navigate("/register"); // Бүртгэл рүү шилжүүлэх
  };

  return (
    <div className="container">
      <div className="login-form">
        <h2>Нэвтрэх</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            className="input"
            type="email"
            placeholder="Имэйл"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Нууц үг"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="button" type="submit">
            Нэвтрэх
          </button>
        </form>
        <p className="register-link">
          Бүртгүүлэх үү?{" "}
          <span onClick={handleRegister} className="link">Энд дарна уу.</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
