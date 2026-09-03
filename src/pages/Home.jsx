import { useState } from "react";
import { Box, Button, Group, Paper, Text, Title } from '@mantine/core';
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
    <Box p="xl">
      <Group justify="space-between" align="center" mb="xl">
        <Title order={2}>Listing</Title>
        <Button size="xs" onClick={handleLogout} loading={isLoggingOut}>
          Log out
        </Button>
      </Group>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridAutoRows: "300px",
          gap: "var(--mantine-spacing-xl)",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Paper
            key={i}
            withBorder
            p="lg"
            shadow="sm"
            style={{
              borderRadius: 8,
              borderTop: "3px solid var(--mantine-color-blue-6)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text fw={600} fz="lg" mb="sm">
              Listings
            </Text>
            <Box
              style={{
                flex: 1,
                border: "1px dashed var(--mantine-color-gray-4)",
                borderRadius: 4,
                display: "flex",
              }}
              p="sm"
            >
              <Text size="sm" c="dimmed" style={{ margin: "auto" }}>
                No details added yet
              </Text>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}