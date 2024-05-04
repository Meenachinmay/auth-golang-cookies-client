"use client";
import { useForm, SubmitHandler} from "react-hook-form";

import { useNavigate} from "react-router-dom";

interface FormInputs {
    email: string;
    password: string;
}

function Login() {
    const { register, reset, handleSubmit, formState: { errors }} = useForm<FormInputs>();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<FormInputs> = async data => {
        try {
            const response = await fetch("http://localhost:8080/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(data)
            })

            if (!response.ok && response.status === 401) {
                throw new Error("UNAUTHORIZED")
            }

            const result = await response.json()
            console.log("login success", result);
            localStorage.setItem("token", result.token);
            localStorage.setItem("userId", result.userId);
            navigate("/dashboard")
            reset();

        } catch(error) {
            console.error("login error:", error)
        }
    }

    return (
        <main className={"flex flex-col w-full h-screen bg-slate-300 p-8"}>
            <form
                className={"flex flex-col space-y-3 w-full h-full bg-white p-8 border border-gray-300 rounded-lg items-center justify-center"}
                onSubmit={handleSubmit(onSubmit)}
            >
                <p className={"text-2xl text-gray-800 underline"}>Login form</p>
                <div className={"flex flex-col w-full"}>
                    <label className={"text-xs text-gray-800 font-bold mb-1"}>Email</label>
                    <input {...register("email", { required: "email is required"})} type={"text"} placeholder={"Email address"}
                           className={"w-full h-[30px] bg-slate-200 py-1 px-2 focus:outline-none"}/>
                    { errors.email && <p className={"text-xs text-red-500"}>{errors.email.message}</p>}
                </div>
                <div className={"flex flex-col w-full"}>
                    <label className={"text-xs text-gray-800 font-bold mb-1"}>Password</label>
                    <input {...register("password", { required: "password is required"})} type={"text"} placeholder={"Password"}
                           className={"w-full h-[30px] bg-slate-200 text-gray-800 py-1 px-2 focus:outline-none"}/>
                    { errors.password && <p className={"text-xs text-red-500"}>{errors.password.message}</p>}
                </div>
                <button type={"submit"} className={"w-full p-3 bg-violet-500 text-white text-center cursor-pointer"}>SignIn</button>
            </form>
        </main>
    )
}

export default Login;