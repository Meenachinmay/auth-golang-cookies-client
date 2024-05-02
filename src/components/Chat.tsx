"use client";

import {useEffect, useState} from "react";
import { useForm, SubmitHandler} from "react-hook-form";
import { useNavigate} from "react-router-dom";

import { v4 as uuidv4 } from 'uuid';
import Pusher from "pusher-js";

interface Message {
    id: string;
    username: string;
    message: string;
}

interface FormInputs {
    username: string;
    message: string;
}

function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const { register, handleSubmit, reset, formState: { errors }} = useForm<FormInputs>();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<FormInputs> = async data => {
        const newMessage: Message = {
            ...data,
            id: uuidv4()
        }
        setMessages([...messages, newMessage]);
        try {
            const response = await fetch("http://localhost:8080/send-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(newMessage),
            })

            if (!response.ok && response.status === 401) {
                throw new Error("UNAUTHORIZED")
            }

            const result = await response.json()
            console.log("send message response", result);

        } catch(error) {
            console.error("send message error:", error)
        }
        reset();
    }

    async function logout () {
        try {
            const response = await fetch("http://localhost:8080/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
            })

            if (!response.ok && response.status === 401) {
                throw new Error("UNAUTHORIZED")
            }

            const result = await response.json()
            console.log("logout", result);
            navigate("/auth/login")

        } catch(error) {
            console.error("logout error:", error)
        }
    }

    useEffect(() => {
        let pusher = new Pusher("a588c229c6c62e81460e", {
            channelAuthorization: {
                endpoint: "http://localhost:8080/pusher/auth",
                transport: 'ajax',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
            cluster: "ap3",
        })

        let channel = pusher.subscribe('private-5d03b8d9-fa7b-49a9-bd08-e9fae82c79e5')
        // let channel = pusher.subscribe('public-chat')

        channel.bind("new-message", function(data: any) {
            console.log("data from the pusher event" + data)
            alert("Received a message: " + JSON.stringify(data));
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])


    return (
        <main className="flex w-full h-screen bg-slate-200 p-8">
            <div className="w-full h-full border border-gray-400 p-8 rounded-2xl">
                <form onSubmit={handleSubmit(onSubmit)} className={"flex flex-col space-y-3"}>
                    <div className={"flex flex-col text-gray-800 space-y-1"}>
                        <label className="text-md font-bold">Username</label>
                        <input {...register("username", {required: "username is required"})}
                               className={"w-auto h-[40px] focus:outline-none p-3"} id={"username"}/>
                        {errors.username && <p className={"text-red-500 text-xs"}>{errors.username.message}</p>}
                    </div>
                    <div className={"flex flex-col text-gray-800 space-y-1"}>
                        <label className="text-md font-bold">Message</label>
                        <input {...register("message", {required: "password is required"})}
                               className={"w-auto h-[40px] focus:outline-none p-3"} id={"password"}/>
                        {errors.message && <p className={"text-red-500 text-xs"}>{errors.message.message}</p>}
                    </div>
                    <div className={"flex flex-col text-gray-800 space-y-1"}>
                        <button type={"submit"}
                                className={"w-1/4 text-center bg-violet-500 h-[30px] text-white rounded-sm cursor-pointer"}>Send
                        </button>

                    </div>
                    <button onClick={logout}
                            className={"w-1/4 text-center bg-violet-500 h-[30px] text-white rounded-sm cursor-pointer"}>Logout
                    </button>
                    <div className={"flex flex-col text-gray-800"} style={{marginTop: "20px"}}>
                        <label className="text-md font-bold">Messages</label>
                        <div className={"flex flex-col w-full h-[500px] bg-white p-8 space-y-2"}>
                            {
                                messages.map((message, index) => (
                                    <>
                                        <ul className={"flex flex-col space-y-2"} key={message.id}>
                                            <li className={"underline"}>{message.username}</li>
                                            <li className={"w-auto bg-blue-400 text-white py-1 px-2 rounded-2xl"}>{message.message}
                                            </li>
                                        </ul>
                                    </>
                                ))
                            }
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default Chat;
