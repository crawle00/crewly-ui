import { useEffect, useState } from "react";
import { Anchor, Box, Button, Group, Paper, Title, Text, Stack } from '@mantine/core';
import { useNavigate } from '../router';
import { getUsers, login } from "../api/API.js";

// TODO: replace with a real login form; this is a placeholder test account.
const TEST_EMAIL = "johnny@cerawley.com";
const TEST_PASSWORD = "password";

export default function Home() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    login(TEST_EMAIL, TEST_PASSWORD)
      .then(getUsers)
      .then(setUsers)
      .catch(console.error);
  }, []);

  return (
    <Box mih="100vh" display="flex" style={{ flexDirection: "column" }}>
      <Box
        bg="#0B3D24"
        py="lg"
        px="xl"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        <Text
          c="#F7F5F0"
          fw={500}
          style={{ cursor: "pointer" }}
          onClick={() => navigate('/users/1')}
        >
          Users
        </Text>

        <Title order={2} c="white" ta="center" fw={700} style={{ letterSpacing: 0.5 }}>
          Crewly
        </Title>

        <Group gap="md" justify="end">
          <Button
            variant="outline"
            onClick={() => navigate('/about')}
            style={{ borderColor: "#F7F5F0", color: "#F7F5F0" }}
          >
            About
          </Button>
          <Button
            variant="white"
            color="dark"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </Group>
      </Box>

      <Box
        bg="#081A11"
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridAutoRows: "300px",
          gap: "var(--mantine-spacing-xl)",
          padding: "var(--mantine-spacing-xl)",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Paper
            key={i}
            bg="#F7F5F0"
            p="lg"
            shadow="sm"
            style={{
              borderRadius: 4,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text fw={600} fz="lg" c="#1B1B18" mb="sm">
              Listings
            </Text>
            <Box
              style={{
                flex: 1,
                border: "1px dashed #C9C4B6",
                borderRadius: 2,
                display: "flex",
              }}
              p="sm"
            >
              <Text size="sm" c="#8A8578" style={{ margin: "auto" }}>
                No details added yet
              </Text>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box
        bg="#0B3D24"
        py="xl"
        px="xl"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--mantine-spacing-md)",
        }}
      >
        <Text c="#F7F5F0" size="md">
          Crewly
        </Text>

        <Group gap="lg">
          <Anchor
            c="#F7F5F0"
            size="sm"
            onClick={() => navigate('/about')}
            style={{ cursor: "pointer" }}
          >
            About
          </Anchor>
          <Anchor
            c="#F7F5F0"
            size="sm"
            onClick={() => navigate('/login')}
            style={{ cursor: "pointer" }}
          >
            Login
          </Anchor>
          <Anchor c="#F7F5F0" size="sm" href="mailto:hello@crewly.com">
            Contact
          </Anchor>
        </Group>
      </Box>
    </Box>
  );
}
