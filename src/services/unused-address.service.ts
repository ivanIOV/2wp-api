import {inject} from '@loopback/core';
import {getLogger, Logger} from 'log4js';
import {BitcoinService} from '.';
import {ServicesBindings} from '../dependency-injection-bindings';
import {BitcoinAddress} from '../models/bitcoin-address.model';
import SatoshiBig from '../utils/SatoshiBig';
import {AddressUsedStatus, UnusedAddressResponse} from '../models';


export class UnusedAddressService {
  private logger: Logger;
  private bitcoinService: BitcoinService;

  constructor(
    @inject(ServicesBindings.BITCOIN_SERVICE)
    bitcoinService: BitcoinService,
  ) {
    this.bitcoinService = bitcoinService;
    this.logger = getLogger('unused-address');
  }

  public isUnusedAddresses(addresses: string[]): Promise<UnusedAddressResponse> {
    this.logger.debug("[isUnusedAddresses] starting to analyse addresses");
    const response: UnusedAddressResponse =  new UnusedAddressResponse({ data: [] });
    const addressInfoPromises = [];
    for (const address of addresses) {
       addressInfoPromises.push(this.bitcoinService.getAddressInfo(address));
    }
    return Promise.all(addressInfoPromises)
    .then((bitcoinAddressList: BitcoinAddress[]) => {
      for (const bitcoinAddress of bitcoinAddressList) {
        const totalReceived: SatoshiBig = new SatoshiBig(bitcoinAddress.totalReceived, 'satoshi');
        const totalSent: SatoshiBig = new SatoshiBig(bitcoinAddress.totalSent, 'satoshi');
        const unused = totalReceived.eq(0) && totalSent.eq(0);
        response.data.push(new AddressUsedStatus({
          address: bitcoinAddress.address,
          unused,
        }));
      }
      return response;
    })
    .catch((e: unknown) => {
       this.logger.trace(`[isUnusedAddresses] ${JSON.stringify(addresses)} '}`);
       this.logger.warn(`[isUnusedAddresses] Failed. ${e}`);
       throw e;
     });
  }
}
