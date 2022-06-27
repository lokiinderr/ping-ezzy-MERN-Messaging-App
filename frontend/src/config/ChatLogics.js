// this is the logic to name the chat, if the chat is group chat the name is going to be same fo rall, but 
// but if it is a one on one chat the name of the chat will be opposite for both the sender and reciever

export const getSender = (loggedUser, users)=>{
    return users[0]._id===loggedUser._id ? users[1].name : users[0].name;
}

export const getSenderFull = (loggedUser, users)=>{
    return users[0]._id===loggedUser._id ? users[1] : users[0];
}

//checks if the message we are at is sent by the opposite user or not
export const isSameSender = (messages, m, i, userId) => {
    return (
        i < messages.length - 1 && 
        (messages[i+1].sender._id !== m.sender._id || messages[i+1].sender._id === undefined) &&
        messages[i].sender._id !== userId 
                                            
    )
}

// checks if the message at which we are is the last message which is sent by the opposite user or not
export const isLastMessage = (messages, i, userId) => {
    return (
        i === messages.length-1 &&
        messages[messages.length-1].sender._id !== userId &&
        messages[messages.length-1].sender._id
    )
}

export const isSameSenderMargin = (messages, m, i, userId) => {
    if(i < messages.length - 1 && 
        (messages[i+1].sender._id === m.sender._id)  &&
        messages[i].sender._id !== userId 
        )
        return 33;
    else if(
        (i < messages.length - 1 && 
        (messages[i+1].sender._id !== m.sender._id)  &&
        messages[i].sender._id !== userId) || 
        (i === messages.length-1 && messages[i].sender._id !== userId)
        )
        return 0;
    else return "auto";
}

export const isSameUser = (messages,m,i) => {
    return i>0 && messages[i-1].sender._id === m.sender._id;
}