import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Dashboard.css'; // Import the CSS file

const Dashboard = () => {
  const { id } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const idInteger = parseInt(id, 10);

  useEffect(() => {
    if (!id || isNaN(idInteger)) {
      setError('ID байхгүй байна.');
      setLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`http://localhost:5000/dashboard/${idInteger}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id: idInteger })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setUserInfo(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [idInteger]);

  return (
    <div className="dashboard-container"> {/* Apply the CSS class */}
      {loading && <p className="loading-message">Ачааллаж байна...</p>} {/* Loading indicator */}

      {error && <p className="error-message">{error}</p>} {/* Error message styling */}

      {userInfo && (
        <div>
          <h2>Хэрэглэгчийн мэдээлэл</h2>
          <p><strong>Нэр:</strong> {userInfo.name}</p>
          <p><strong>Овог:</strong> {userInfo.surname}</p>
          <p><strong>Хаяг:</strong> {userInfo.address}</p>
          <p><strong>Утас:</strong> {userInfo.phone}</p>
          <p><strong>Регистрийн дугаар:</strong> {userInfo.registerNumber}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
