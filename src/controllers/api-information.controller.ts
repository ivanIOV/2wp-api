import {get, getModelSchemaRef} from '@loopback/rest';
import {getLogger, Logger} from 'log4js';
import {ApiInformation} from '../models';

export class ApiInformationController {
  logger: Logger;

  constructor(
  ) {
    this.logger = getLogger('api-information-controller');
  }

  @get('/api', {
    responses: {
      '200': {
        description: 'API information',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ApiInformation),
          },
        },
      },
    },
  })
  getApiInformation():ApiInformation {
    let version = process.env.npm_package_version;

    if(!version) {
      const packageJson = require('../../package.json');
      console.log(packageJson.version);
      version = packageJson.version;
    }

    this.logger.debug(`[getApiInformation] current version : ${version}`);
    const apiInfo = new ApiInformation();
    apiInfo.version = version;
    return apiInfo;
  }
}
