import AppDataSource from "../../data-source";

import { Server, Socket } from "socket.io"
import { Message } from "../../entities/messages.enitity";
import { IClientMessage, IUsersOnline } from "../../interface/socket";
import { User } from "../../entities/user.entity";
import { Room } from "../../entities/room.entity";
import { UserRoom } from "../../entities/userRoom.entity";
import { MessageNotification } from "../../entities/messageNotification.entity";
import createMessageService from "../../services/messages/createMessage.service";


const messageServices = (io: Server, socket: Socket)=>{
  const userRepository = AppDataSource.getRepository(User)
  const roomRepository = AppDataSource.getRepository(Room)
  const userRoomRepository = AppDataSource.getRepository(UserRoom)

  const sendMessage = async (usersOnline: IUsersOnline[], {message, user, roomId}: IClientMessage) =>{
      const dateNow = Date.now();
      const createdAt = new Date(dateNow)
      io.to(roomId).emit("message:send", {message, user, roomId, createdAt})
  
      try {
        const room = await roomRepository.findOne({where: {id: roomId}, relations: ['roomUsers', 'roomUsers.user'] })
        const messageNotificationRepository = AppDataSource.getRepository(MessageNotification)
      
        if(!room){
          throw new Error
        }

        //open room to all users if is closed
        room.roomUsers.forEach((roomUser) =>{
          if(roomUser.isActive === false && roomUser.user.id !== user.id){
            roomUser.isActive = true;
            userRoomRepository.save(roomUser);
  
            //if user online, refresh rooms list on client.
            const userOnline = usersOnline.find(userOn => userOn.userId === roomUser.user.id);
            if(userOnline) io.to(userOnline?.socketId).emit('message:openRoom',{userId: user.id})
          }
        })
  
        //save message on database 
          const newMessage: Message = await createMessageService({message, roomId, userId: user.id})
  
          if(newMessage){
            //create notification on database for offline users
            const removeSender = room.roomUsers.filter((x) => x.user.id !== user.id  )
            removeSender.forEach(async (user)=>{
              const userIsOffline = usersOnline.some((userOnline)=>userOnline.userId === user.user.id)
              
              if(!userIsOffline){
                const userExists = await userRepository.findOne({where: {id: user.user.id}})
                if(userExists){
                  const newNotification = new MessageNotification();
                  newNotification.message = newMessage
                  newNotification.user = userExists;
                  newNotification.room = room;
                  newNotification.viewed = false;
                  await messageNotificationRepository.save(newNotification)
                }
              } 
            })
          }
      } catch (error) {
        console.log(error)
      }
  }

  return { sendMessage }
}

export default messageServices