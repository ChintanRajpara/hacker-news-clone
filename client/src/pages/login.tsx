import { useState } from "react";
import { useLogin } from "../utils/mutations/useLogin";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate } = useLogin();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        mutate({ email, password });
      }}
    >
      <div>
        <div>
          <input
            required
            type={"email"}
            placeholder="Email"
            onChange={(e) => {
              const email = e.target.value;
              setEmail(email);
            }}
            value={email}
          />
        </div>

        <div>
          <input
            required
            type={"password"}
            placeholder="Password"
            onChange={(e) => {
              const password = e.target.value;
              setPassword(password);
            }}
            value={password}
          />
        </div>

        <button type="submit">Login</button>
      </div>
    </form>
  );
};
