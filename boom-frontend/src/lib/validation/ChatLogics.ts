import { getUserById } from "../mongodb/api";

export const getReceiver = async (loggedUserId: string, users: any) => {
    if(loggedUserId){
    const anotherUser = users[0] === loggedUserId ? users[1] : users[0];
    console.log("anotherUser",anotherUser)
    //getUserById function is a async function
    return getUserById(anotherUser).then((anotherUserDetails: any) => {
        return anotherUserDetails; // Access the resolved data
      });
    }
  };

  export const formatDate = (isoDate: string) => {
    const date = new Date(isoDate); // Convert ISO date to Date object
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
  
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
  
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  export const isSameSender = (messages: any, m: any, i: any, userId: any) => {
    return (
      i < messages.length - 1 &&
      (messages[i + 1].sender.$id !== m.sender.$id ||
        messages[i + 1].sender.$id === undefined) &&
      messages[i].sender.$id !== userId
    );
  };

  export const isLastMessage = (messages: any, i: any, userId: any) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender.$id !== userId &&
      messages[messages.length - 1].sender.$id
    );
  };

  export const isSameSenderMargin = (messages: any, m: any, i: any, userId: any) => {
    if (
      i < messages.length - 1 &&
      messages[i + 1].sender.$id === m.sender.$id &&
      messages[i].sender.$id !== userId
    )
      return 33;
    else if (
      (i < messages.length - 1 &&
        messages[i + 1].sender.$id !== m.sender.$id &&
        messages[i].sender.$id !== userId) ||
      (i === messages.length - 1 && messages[i].sender.$id !== userId)
    )
      return 0;
    else return "auto";
  };

  export const isSameUser = (messages: any, m: any, i: any) => {
    return i > 0 && messages[i - 1].sender.$id === m.sender.$id;
  };