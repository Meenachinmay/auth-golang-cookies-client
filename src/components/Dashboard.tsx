import OnlineUserCard from "./reuseable/OnlineUserCard";
import {useEffect, useState} from "react";
import Pusher from "pusher-js";

interface NewLogin {
    userId: string;
    username: string;
}

let pusher_key = process.env.PUSHER_APP_KEY;

function Dashboard() {
    const [newLogin, setNewLogin] = useState<NewLogin[]>([]);

    useEffect(() => {
        // fetch online users
        async function FetchOnlineUsers () {
            const response = await fetch("http://localhost:8080/fetch-online-users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })

            if (response.ok) {
                const data = await response.json()
                const onlineUsers: NewLogin[] = data.onlineUsers;

                setNewLogin(prevState => {
                    const existingIds = new Set(prevState.map(user => user.userId));
                    const filteredUsers = onlineUsers.filter(user => {
                        return !existingIds.has(user.userId);
                    });
                    return [...prevState, ...filteredUsers];
                });
            }

        }
        FetchOnlineUsers()

    }, []);

    useEffect(() => {
        // @ts-ignore
        let pusher = new Pusher(pusher_key, {
            cluster: "ap3",
        })

        let loginChannel = pusher.subscribe('myuser-login')

        loginChannel.bind("pusher:subscription_succeeded", () => {
            fetch("http://localhost:8080/notify-subscribed", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body:JSON.stringify({ "userId": localStorage.getItem("userId")})
            });
        });

        loginChannel.bind("new-login", function (data: NewLogin) {
            console.log("Received new login via Pusher: " + JSON.stringify(data));
            setNewLogin(prevUsers => {
                const isUserExist = prevUsers.some(user => user.userId === data.userId);
                if (!isUserExist) {
                    return [...prevUsers, data];
                }
                return prevUsers;
            });
        })

        return () => {
            loginChannel.unbind_all();
            loginChannel.unsubscribe();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return (
        <main className={"flex flex-col w-full h-screen bg-slate-300 p-8"}>
            <div className={"flex w-full h-full bg-white p-8 rounded-lg border border-gray-300 "}>
                <div
                    className={"flex flex-col space-y-3 w-1/2 max-h-full overflow-y-auto bg-white border border-blue-500 rounded-lg p-4"}
                >
                    {
                       newLogin.map((item: NewLogin) => <OnlineUserCard userId={item.userId} username={item.username} key={item.userId}/>)
                    }
                </div>
            </div>
        </main>
    )
}

export default Dashboard;