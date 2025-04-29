import { useState } from "react";
import { useSignup } from "../utils/mutations/useSignup";

export const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate } = useSignup();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        mutate({ email, name, password });
      }}
    >
      <div>
        <div>
          <input
            required
            placeholder="Name"
            onChange={(e) => {
              const name = e.target.value;
              setName(name);
            }}
            value={name}
          />
        </div>

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

        <button type="submit">Signup</button>
      </div>
    </form>
  );
};
