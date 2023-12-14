import { Container } from 'inversify';
import { TYPES } from './type';
import { IPortkeyAccountService, IPortkeyUIManagerService } from './base';
import { PortkeyAccountService } from './account';
import { UIManagerService } from 'service/ui';

const myContainer = new Container();
myContainer.bind<IPortkeyAccountService>(TYPES.AccountModule).to(PortkeyAccountService);
myContainer.bind<IPortkeyUIManagerService>(TYPES.UIManagerModule).to(UIManagerService);

export { myContainer };
