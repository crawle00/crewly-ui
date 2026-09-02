import { useEffect, useState } from "react";
import { getUsers, login } from "../api/API.js";

// TODO: replace with a real login form; this is a placeholder test account.
const TEST_EMAIL = "johnny@cerawley.com";
const TEST_PASSWORD = "password";

export default function Home() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    login(TEST_EMAIL, TEST_PASSWORD)
      .then(getUsers)
      .then(setUsers)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Users</h2>

      {users.map((user) => (
        <div key={user._id}>
          <p>
            {user.firstName} {user.lastName}
          </p>
          <p>{user.bio}</p>
        </div>
      ))}
    </div>
  );
}
