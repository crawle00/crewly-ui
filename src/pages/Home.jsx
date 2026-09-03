import { useState } from "react";
import { Button } from '@mantine/core';
import { logout } from '../api/API';
import { useNavigate } from '../router';

export default function Home() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div>
      <h2>Home</h2>
      <Button size="xs" onClick={handleLogout} loading={isLoggingOut}>
        Log out
      </Button>
    </div>
  );
}