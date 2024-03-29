import { Socket, Server } from "socket.io"
import { IClientMessage, IUserJoinRoomSocket, IUserReadySocket, IUserRegisterSocket, IUsersOnline } from "../../interface/socket";
import userServices from "../services/user.services";
import messageServices from "../services/message.services";

const initSocketController = (io: Server) =>{
  let usersOnline:IUsersOnline[] = [];

  io.on("connection", (socket: Socket) => {

    socket.on("connect", ()=>{
    })
  
    socket.on("user:register", ({userId}: IUserRegisterSocket)=>{
      userServices(io, socket).registerUser(usersOnline, {userId});
    })

    socket.on("user:ready", async ({userId, activeRooms}: IUserReadySocket)=>{
      userServices(io, socket).userListReady(usersOnline, {userId, activeRooms});
    })
  
    socket.on("disconnect", async () => {
      const users = await userServices(io, socket).disconnect(usersOnline);
      if(users) usersOnline = users;
    });
  
    socket.on("message:send", async ({message, user, roomId}: IClientMessage) => {
      messageServices(io, socket).sendMessage(usersOnline, {message, user, roomId})
    });
  
    socket.on('user:joinRoom', ({room}: IUserJoinRoomSocket)=>{
      socket.join(room);
    })
  });

}

export default initSocketController;