export interface IUser {
  id: string;
  email: string;
  name: string;
}

export type GetMeResponse = {
  user?: IUser;
};
