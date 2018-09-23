
# jsfix

1. fast native clean fix engine
1. quickfix or repo based data dictionary
1. compile interface types against definitions
1. ascii / fixml supported
1. parses repeat groups, components and raw data fields
1. views make convinient ways of accessing data
1. complete trade capture sample to get started
1. a skeleton example shows connection, login and session only
1. parse fix logs into human readable format - JSON, tokens
1. socket session management for login, heartbeat etc
1. initiator or acceptor

## Native Typescript FIX Engine

This fix engine provides fast easy API to parse or send FIX based messages.

### extensive documentation coming soon.

## Installing

Install the package from npm:

```shell
coming soon on npm
```

clone from git

```shell
    git clone https://github.com/TimelordUK/jsfix.git
    cd jsfix
    npm install
    npm run unzip-repo
    # install typescript if not installed
    npm install -g typescript
    tsc
    # run demo app
    npm run tcp-tc
```

# Run Sample

The code provided in src/sample/tcp/trade_capture is a good place to start in building an application with this library. In this case both client and server are run together communicating over a socket.  In reality a client is more likely connecting to an external acceptor such as CME, ICE.

There is also a skeleton application which shows all application code stripped away to just enough to create a connection, login and see the session.

Both examples will automatically close down after ~1 minute or can be terminated CTRL-C

ensure the repo dictionary has been unpacked above.  This provides the data dictionary
used to parse messages.

run a full application example the trade capture or a simple skeleton

```shell
npm run tcp-tc
```

```shell
npm run tcp-sk
```

## sample trade-capture-client.ts

the method onApplicationMsg is called when a message is received.  In this case the client has inherited from FixSession which carries out the session management.

```typescript
  constructor (public readonly config: IJsFixConfig) {
    super(config)
    this.logReceivedMsgs = true
    this.reports = new Dictionary<ITradeCaptureReport>()
    this.fixLog = config.logFactory.plain(`jsfix.${config.description.application.name}.txt`)
    this.logger = config.logFactory.logger(`${this.me}:TradeCaptureClient`)
  }

  protected onApplicationMsg (msgType: string, view: MsgView): void {
    this.logger.info(`${view.toJson()}`)
    switch (msgType) {
      case MsgType.TradeCaptureReport: {
        // create an object and cast to the interface
        const tc: ITradeCaptureReport = view.toObject()
        this.reports.addUpdate(tc.TradeReportID, tc)
        this.logger.info(`[reports: ${this.reports.count()}] received tc ExecID = ${tc.ExecID} TradeReportID  = ${tc.TradeReportID} Symbol = ${tc.Instrument.Symbol} ${tc.LastQty} @ ${tc.LastPx}`)
        break
      }

      case MsgType.TradeCaptureReportRequestAck: {
        const tc: ITradeCaptureReportRequestAck = view.toObject()
        this.logger.info(`received tcr ack ${tc.TradeRequestID} ${tc.TradeRequestStatus}`)
        break
      }
    }
  }
```

the client onReady method is called when a connection is made and logon established and confirmed.  In this case, client sends a trade capture request to the server.

```typescript
  protected onReady (view: MsgView): void {
    this.logger.info('ready')
    const tcr: ITradeCaptureReportRequest = TradeFactory.tradeCaptureReportRequest('all-trades', new Date())
    // send request to server
    this.send(MsgType.TradeCaptureReportRequest, tcr)
    const logoutSeconds = 32
    this.logger.info(`will logout after ${logoutSeconds}`)
    setTimeout(() => {
      this.done()
    }, logoutSeconds * 1000)
  }

```

## working with Views

see src/test/view-decode.test.ts

note that a view can only be used within a callback context unless it is cloned.  Once returned, the memory is re-used for next message.  It is intended to convert to an object or parsed into an application specific message.

fetch a set of tags

```typescript
  const [a, b, c, d] = view.getTypedTags([8, 9, 35, 49])
  expect(a).toEqual('FIX4.4')
  expect(b).toEqual(2955)
  expect(c).toEqual('W')
  expect(d).toEqual('sender-10')
```

convert view into an object which can be used alongside an interface for intellisense.

```typescript
  import { ITradeCaptureReport } from '../../../types/FIX4.4/repo/trade_capture_report'
  import { ITradeCaptureReportRequest } from '../../../types/FIX4.4/repo/trade_capture_report_request'

 const tc: ITradeCaptureReport = view.toObject()
```

get a tokenised view of tags in view

```typescript
console.log(view.toString())
```

get a component from parent - this is very low cost

```typescript
 const instrumentView: MsgView = view.getView('Instrument')
 const instrumentObject: IInstrument = view.getView('Instrument').toObject()
```

## performance on Windows Intel Core I7-4770 @ 3.5 GHz

These messages have been randomly generated with command line tool. They are syntactically valid.

### data/examples/FIX.4.4/repo/execution-report/fix.txt

```shell
[8]: repeats = 250000, fields = 58, length = 604 chars, elapsed ms 3658, 14.632 micros per msg
```

### data/examples/FIX.4.4/repo/security-definition/fix.txt

```shell
[d]: repeats = 150000, fields = 223, length = 2233 chars, elapsed ms 7962, 53.080000000000005 micros per msg
```

### data/examples/FIX.4.4/repo/trade-capture/fix.txt

```shell
npm run repo44-bench-tc
```

```shell
[AE]: repeats = 30000, fields = 613, length = 5818 chars, elapsed ms 5206, 173.53333333333333 micros per msg
```

# Log parsing

the command line tool jsfix can be used to parse any fix log providing an appropriate dictionary is provided.

## parsing fields

```shell
npm run cmd -- -session=data/session/test-initiator.json --fix=data/examples/FIX.4.4/jsfix.test_client.txt --delimiter="|" --type=AD --tokens
```

```shell
[0] 8 (BeginString) = FIX4.4, [1] 9 (BodyLength) = 0000135
[2] 35 (MsgType) = AD[TradeCaptureReportRequest], [3] 49 (SenderCompID) = init-comp
[4] 56 (TargetCompID) = accept-comp, [5] 34 (MsgSeqNum) = 2
[6] 57 (TargetSubID) = fix, [7] 52 (SendingTime) = 20180923-16:07:04.763
[8] 568 (TradeRequestID) = all-trades, [9] 569 (TradeRequestType) = 0[AllTrades]
[10] 263 (SubscriptionRequestType) = 1[SnapshotAndUpdates], [11] 580 (NoDates) = 1
[12] 75 (TradeDate) = 20180923, [13] 10 (CheckSum) = 250
```

## stats on entire file

```shell
npm run cmd -- -session=data/session/test-initiator.json --fix=data/examples/FIX.4.4/jsfix.test_client.txt --delimiter="|" --stats
```

```json
messages 13 elapsed ms 8
{
    "0": 1,
    "5": 2,
    "A": 2,
    "AD": 1,
    "AQ": 2,
    "AE": 5
}
```

## benchmark parsing repeated reads of file

```cmd
npm run cmd -- -session=data/session/test-initiator.json --fix=data/examples/FIX.4.4/jsfix.test_client.txt --delimiter="|" --stats --repeats=20
```

```cmd
messages 13 elapsed ms 0
{
    "0": 1,
    "5": 2,
    "A": 2,
    "AD": 1,
    "AQ": 2,
    "AE": 5
}
```

## parse message type in a file

```cmd
npm run cmd -- -session=data/session/test-initiator.json --fix=data/examples/FIX.4.4/jsfix.test_client.txt --delimiter="|" --type=AD --objects
```

```json
{
    "StandardHeader": {
        "BeginString": "FIX4.4",
        "BodyLength": 135,
        "MsgType": "AD",
        "SenderCompID": "init-comp",
        "TargetCompID": "accept-comp",
        "MsgSeqNum": 2,
        "TargetSubID": "fix",
        "SendingTime": "2018-09-23T16:07:04.763Z"
    },
    "TradeRequestID": "all-trades",
    "TradeRequestType": 0,
    "SubscriptionRequestType": "1",
    "TrdCapDtGrp": [
        {
            "TradeDate": "2018-09-22T23:00:00.000Z"
        }
    ],
    "StandardTrailer": {
        "CheckSum": "250"
    }
}
```