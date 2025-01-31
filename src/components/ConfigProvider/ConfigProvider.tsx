import * as React from 'react';
import { AppearanceType } from '@vkontakte/vk-bridge';
import { canUseDOM, useDOM } from '../../lib/dom';
import {
  AppearanceScheme,
  ConfigProviderContext,
  ConfigProviderContextInterface,
  defaultConfigProviderProps,
  Scheme,
} from './ConfigProviderContext';
import { PlatformType, VKCOM } from '../../lib/platform';
import { useIsomorphicLayoutEffect } from '../../lib/useIsomorphicLayoutEffect';
import { useObjectMemo } from '../../hooks/useObjectMemo';
import { noop } from '../../lib/utils';
import { warnOnce } from '../../lib/warnOnce';

export interface ConfigProviderProps extends ConfigProviderContextInterface {
  /**
   * Цветовая схема приложения
   */
  scheme?: AppearanceScheme;
}

const warn = warnOnce('ConfigProvider');

function useSchemeDetector(node: HTMLElement, _scheme: Scheme | 'inherit') {
  const inherit = _scheme === 'inherit';
  const getScheme = () => {
    if (!inherit || !canUseDOM) {
      return undefined;
    }
    return node.getAttribute('scheme') as Scheme;
  };
  const [resolvedScheme, setScheme] = React.useState(getScheme());

  React.useEffect(() => {
    if (!inherit) {
      return noop;
    }
    setScheme(getScheme());
    const observer = new MutationObserver(() => setScheme(getScheme()));
    observer.observe(node, { attributes: true, attributeFilter: ['scheme'] });
    return () => observer.disconnect();
  }, [inherit]);

  return _scheme === 'inherit' ? resolvedScheme : _scheme;
}

const deriveAppearance = (scheme: Scheme): AppearanceType =>
  scheme === Scheme.SPACE_GRAY || scheme === Scheme.VKCOM_DARK ? 'dark' : 'light';

function normalizeScheme(scheme: AppearanceScheme, platform: PlatformType): Scheme | 'inherit' {
  if (scheme === 'inherit') {
    return scheme;
  }
  if (scheme === Scheme.VKCOM) {
    process.env.NODE_ENV === 'development' && warn(`Схема "${Scheme.VKCOM}" устарела и будет удалена 5.0.0. Вместо неё используйте "${Scheme.VKCOM_LIGHT}"`);
    return Scheme.VKCOM_LIGHT;
  }
  if (platform === VKCOM && (scheme === Scheme.BRIGHT_LIGHT || scheme === Scheme.SPACE_GRAY)) {
    process.env.NODE_ENV === 'development' && warn(`Платформа "vkcom" и схема "${scheme}" несовместимы. С этой платформой можно использовать схемы "${Scheme.VKCOM_LIGHT}" или "${Scheme.VKCOM_DARK}"`);
    return Scheme.VKCOM_LIGHT;
  }
  switch (scheme) {
    case Scheme.DEPRECATED_CLIENT_LIGHT:
      return Scheme.BRIGHT_LIGHT;
    case Scheme.DEPRECATED_CLIENT_DARK:
      return Scheme.SPACE_GRAY;
    default:
      return scheme as Scheme;
  }
}

const ConfigProvider: React.FC<ConfigProviderProps> = ({
  children,
  schemeTarget,
  ...config
}: ConfigProviderProps & { children?: React.ReactNode; schemeTarget?: HTMLElement }) => {
  const scheme = normalizeScheme(config.scheme, config.platform);
  const { document } = useDOM();
  const target = schemeTarget || document?.body;

  useIsomorphicLayoutEffect(() => {
    if (scheme === 'inherit') {
      return noop;
    }
    if (process.env.NODE_ENV === 'development' && target.hasAttribute('scheme')) {
      warn('<body scheme> was set before VKUI mount - did you forget scheme="inherit"?');
    }
    target.setAttribute('scheme', scheme);
    return () => target.removeAttribute('scheme');
  }, [scheme]);

  const realScheme = useSchemeDetector(target, scheme);
  const configContext = useObjectMemo({ appearance: deriveAppearance(realScheme), ...config });

  return (
    <ConfigProviderContext.Provider value={configContext}>
      {children}
    </ConfigProviderContext.Provider>
  );
};

// Деструктуризация нужна из бага в react-docgen-typescript
// https://github.com/styleguidist/react-docgen-typescript/issues/195
ConfigProvider.defaultProps = { ...defaultConfigProviderProps };

export default ConfigProvider;
