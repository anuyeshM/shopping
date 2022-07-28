import { createGlobalStyle } from 'styled-components';

/*
import Calibri from './Calibri.woff';
import Consolas from './Consolas.woff';
import RobotoRegular from './Roboto-Regular.woff';
import Montserrat from './montserrat-v15-latin-regular.woff';
*/
import Malayalam from './MalayalamMN.woff';
import MalayalamBold from './MalayalamMN-Bold.woff';

export default createGlobalStyle`
    @font-face {
        font-family: 'GMCL';
        src: url(${Malayalam}) format('woff');
        font-weight: normal;
        font-style: normal;
    }
    @font-face {
        font-family: 'GMCL';
        src: url(${MalayalamBold}) format('woff');
        font-weight: bold;
        font-style: normal;
    }
`;
