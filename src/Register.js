import { useState } from "react";
import axios from "axios";
import './Register.css'; 
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/register", {
        email,
        password,
        name,
        surname,
        address,
        phone,
        registerNumber,
      });
      setMessage("Бүртгэл амжилттай!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Алдаа гарлаа.");
    }
  };

  const handleLogin = () => {
    navigate("/login"); 
  };

  return (
    <div className="container">
      <div className="register-form">
        <h2>Бүртгүүлэх</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleRegister}>
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
          <input
            className="input"
            type="text"
            placeholder="Нэр"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="input"
            type="text"
            placeholder="Овог"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
          <input
            className="input"
            type="text"
            placeholder="Хаяг"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <input
            className="input"
            type="tel"
            placeholder="Утасны дугаар"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            className="input"
            type="text"
            placeholder="РД дугаар"
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value)}
            required
          />
          <button className="button" type="submit">
            Бүртгүүлэх
          </button>
        </form>
        <p className="register-link">
          Нэвтрэх хэсэгрүү буцах?{" "}
          <span onClick={handleLogin} className="link">Энд дарна уу.</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
