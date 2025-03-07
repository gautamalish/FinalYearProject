import React, { useContext, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import googleIcon from "../assets/googleIcon.png";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useContext(AuthContext);
  // state to hold input fields data
  const [formData, setFormData] = useState({
    name: "",
    "Ph.No": "",
    email: "",
    password: "",
  });
  function handleFormData(e) {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }
  // Handling the form Submit and registering the user
  function handleSubmit(e) {
    e.preventDefault();
    try {
      createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = auth.currentUser;
      console.log(user);
      console.log("User registered Successfully");
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  }

  const signUpWithGoogle = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("User signed in: ", result.user);
        navigate("/");
      })
      .catch((error) => {
        console.error("Error during sign-in ", error.message);
      });
  };
  return (
    <div className="m-auto w-4/5 border border-blue-500 flex items-center flex-col ">
      <div className="mt-14">
        <h1 className="text-4xl flex justify-center items-center">
          <span className="text-gold">Hire</span>Me
        </h1>
        <h3 className="text-2xl mt-10">Create a new Account</h3>
      </div>
      <form className="flex flex-col items-center gap-3 mt-3 w-full">
        <input
          type="text"
          placeholder="Name"
          className="border border-gray-500 rounded-2xl p-1.5 w-3/12"
          onChange={handleFormData}
          value={formData.name}
          name="name"
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="border border-gray-500 rounded-2xl p-1.5 w-3/12"
          onChange={handleFormData}
          value={formData["Ph.No"]}
          name="Ph.No"
        />
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-500 rounded-2xl p-1.5 w-3/12"
          onChange={handleFormData}
          value={formData.email}
          name="email"
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-500 rounded-2xl p-1.5 w-3/12"
          onChange={handleFormData}
          value={formData.password}
          name="password"
        />
        <div className="w-1/4 flex justify-end mt-3">
          <button
            className="bg-gold w-24 h-12 rounded-3xl flex justify-center items-center"
            onClick={handleSubmit}
          >
            <FaArrowRight size={30} color="white" />
          </button>
        </div>
      </form>
      <div className="flex w-1/4 items-center justify-end mt-3">
        <p className="underline cursor-pointer">Forgot Password?</p>
      </div>
      <div className="mt-3">
        <p className="flex justify-center">Or</p>
        <button
          className="border border-gray-400 rounded-lg flex items-center gap-1 p-2 m-auto mt-3"
          onClick={signUpWithGoogle}
        >
          <img src={googleIcon} alt="GoogleImage" width="24px" />
          Sign Up With Google
        </button>
        <p className="mt-3 ">
          Already have an account?
          <span
            className="underline cursor-pointer"
            onClick={() => navigate("/signin")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
