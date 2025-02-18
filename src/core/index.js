
import Workspace from './modules/workspace';
import User from './modules/user';
import Config from './modules/config';
import Cells from './modules/cells';
import Env from './modules/env';

export default class zApi {
    static workspace = Workspace;
    static user = User;
    static config = Config;
    static cells = Cells;
    static env = Env;
}