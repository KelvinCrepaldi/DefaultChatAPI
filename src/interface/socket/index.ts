export interface IClientMessage{
  message: string,
  user: {
    id: string;
    name: string,
    image: string
  },
  roomId: string
}

export interface IUsersOnline {
  socketId: string,
  userEmail:string
}