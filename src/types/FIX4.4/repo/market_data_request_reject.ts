import { IStandardHeader } from './set/standard_header'
import { IMDRjctGrp } from './set/md_rjct_grp'
import { IStandardTrailer } from './set/standard_trailer'

/*
************************************************************
* The Market Data Request Reject is used when the broker   *
* cannot honor the Market Data Request, due to business or *
* technical reasons.                                       *
************************************************************
*/
export interface IMarketDataRequestReject {
  StandardHeader: IStandardHeader
  MDReqID: string// 262
  MDReqRejReason?: string// 281
  MDRjctGrp?: IMDRjctGrp[]
  Text?: string// 58
  EncodedTextLen?: number// 354
  EncodedText?: Buffer// 355
  StandardTrailer: IStandardTrailer
}
