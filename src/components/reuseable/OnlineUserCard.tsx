
function OnlineUserCard({ username, userId }: { username: string; userId: string }) {
    return(
        <>
            <div className={"w-full h-[70px] bg-blue-100 border border-blue-500 p-2"}>
                <p className={"text-xl"}>{username}</p>
                <p className={"text-sm"}>{userId}</p>
            </div>
        </>
    )
}

export default OnlineUserCard;