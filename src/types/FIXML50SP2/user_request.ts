import { IStandardHeader } from './set/standard_header'

/*
***********************************************
* UserRequest can be found in Volume 1 of the *
*                                             *
* specification                               *
***********************************************
*/
export interface IUserRequest {
  UserRequestID: string// 923
  UserRequestType: number// 924
  Username: string// 553
  Password?: string// 554
  NewPassword?: string// 925
  EncryptedPasswordMethod?: number// 1400
  EncryptedPasswordLen?: number// 1401
  EncryptedPassword?: Buffer// 1402
  EncryptedNewPasswordLen?: number// 1403
  EncryptedNewPassword?: Buffer// 1404
  RawDataLength?: number// 95
  RawData?: Buffer// 96
  StandardHeader?: IStandardHeader
}
