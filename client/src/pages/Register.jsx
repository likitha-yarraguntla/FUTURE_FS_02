import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Register() {
const navigate = useNavigate();

const [formData, setFormData] = useState({
name: "",
email: "",
password: "",
});

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
});
};

const handleSubmit = async (e) => {
e.preventDefault();


try {
  await axios.post(
    "http://localhost:5000/api/auth/register",
    formData
  );

  toast.success("Registration successful!");
  navigate("/login");
} catch (error) {
  toast.error(
    error.response?.data?.message || "Registration failed"
  );
}


};

return ( <div className="flex min-h-screen items-center justify-center bg-slate-100"> <form
     onSubmit={handleSubmit}
     className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
   > <h2 className="mb-6 text-center text-3xl font-bold">
Register </h2>


    <input
      type="text"
      name="name"
      placeholder="Name"
      value={formData.name}
      onChange={handleChange}
      className="mb-4 w-full rounded border p-3"
      required
    />

    <input
      type="email"
      name="email"
      placeholder="Email"
      value={formData.email}
      onChange={handleChange}
      className="mb-4 w-full rounded border p-3"
      required
    />

    <input
      type="password"
      name="password"
      placeholder="Password"
      value={formData.password}
      onChange={handleChange}
      className="mb-4 w-full rounded border p-3"
      required
    />

    <button
      type="submit"
      className="w-full rounded bg-green-600 p-3 text-white hover:bg-green-700"
    >
      Register
    </button>

    <p className="mt-4 text-center">
      Already have an account?{" "}
      <Link to="/login" className="text-blue-600">
        Login
      </Link>
    </p>
  </form>
</div>


);
}

export default Register;
