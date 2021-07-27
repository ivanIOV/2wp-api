import {Model, model, property} from '@loopback/repository';

@model()
export class BtcPeginStatus extends Model {
  @property({
    type: 'string',
  })
  txId: string;

  @property({
    type: 'date',
    defaultFn: 'now'
  })
  creationDate: Date;

  @property({
    type: 'string',
  })
  federationAddress: string;

  @property({
    type: 'number',
  })
  amountTransferred: number;

  @property({
    type: 'string',
  })
  refundAddress: string;

  @property({
    type: 'number',
  })
  confirmations: number;

  @property({
    type: 'number',
  })
  requiredConfirmation: number;

  constructor(btcTxId: string) {
    super();
    this.txId = btcTxId;
  }
}

@model()
export class RskPeginStatus extends Model {
  @property({
    type: 'string',
  })
  recipientAddress: string;

  @property({
    type: 'number',
  })
  confirmations: number;

  @property({
    type: 'Date',
  })
  createOn: Date;

  @property({
    type: 'string',
  })
  status: string;

  constructor() {
    super();
  }
}

@model()
export class PeginStatus extends Model {
  @property({
    type: 'object',
    required: true,
  })
  btc: BtcPeginStatus;

  @property({
    type: 'object',
  })
  rsk: RskPeginStatus;

  @property({
    type: 'object',
  })
  status: Status;

  constructor(btc: BtcPeginStatus, rsk?: RskPeginStatus) {
    super();
    this.status = Status.NOT_IN_BTC_YET;
    if (rsk) {
      this.rsk = rsk;
    } else {
      this.rsk = new RskPeginStatus();
    }
    this.btc = btc;
  }

  public setRskPeginStatus(rskData: RskPeginStatus) {
    this.rsk = rskData;
    // if (rskData.status == 'REJECTED' || rskData.status == 'INVALID') {
    //   this.status = Status.REJECTED_REFUND;  //TODO: Maybe is without REFUND, Resolve when we can get this info
    // } else if (rskData.confirmations >= (Number(process.env.RSK_MINIMUM_CONFIRMATION) ?? 6)) { //TODO: Verify number of confirmations needed
    //   this.status = Status.CONFIRMED;
    // } else {
    //   this.status = Status.NOT_IN_RSK_YET;  //Not confirmed, not rejected, not invalid. Only not saved in database yet.
    // }
    switch (rskData.status) {
      case 'REJECTED': {
        this.status = Status.REJECTED_REFUND;  //TODO: Verify type or REJECTED
        break;
      }
      case 'ACCEPTED': {
        this.status = Status.CONFIRMED;
        break;
      }
      case 'INVALID': {
        throw new Error(`{this.rsk.txId} Invalid tx for RSK nodes. `);
      }
      default: {
        this.status = Status.NOT_IN_RSK_YET;
      }
    }
  }
}
export enum Status {
  NOT_IN_BTC_YET = 'NOT_IN_BTC_YET',
  WAITING_CONFIRMATIONS = 'WAITING_CONFIRMATIONS',
  NOT_IN_RSK_YET = 'NOT_IN_RSK_YET',
  CONFIRMED = 'CONFIRMED',
  REJECTED_NO_REFUND = 'REJECTED_NO_REFUND',
  REJECTED_REFUND = 'REJECTED_REFUND'
}

export type PeginStatusWithRelations = PeginStatus;
