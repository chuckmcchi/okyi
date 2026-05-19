import {type PageData} from '../constants';
import {convertDeep} from './convert';
import {PAGES_ZH_HANS} from './zh-Hans';

export const PAGES_ZH_HANT: Record<string, PageData> = convertDeep(PAGES_ZH_HANS);
