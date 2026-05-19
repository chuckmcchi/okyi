import * as OpenCC from 'opencc-js';

const toTraditional = OpenCC.Converter({from: 'cn', to: 'tw'});

/** 构建期深拷贝简转繁，写入 PAGES_ZH_HANT 供 SSG 使用。 */
export const convertDeep = <T,>(value: T): T => {
  if (typeof value === 'string') {
    return toTraditional(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => convertDeep(item)) as T;
  }
  if (value && typeof value === 'object') {
    const convertedEntries = Object.entries(value).map(([key, nestedValue]) => [
      key,
      convertDeep(nestedValue),
    ]);
    return Object.fromEntries(convertedEntries) as T;
  }
  return value;
};
