import * as React from 'react';
import { HoverPopper, HoverPopperProps } from '../HoverPopper/HoverPopper';
import { ClickPopper, ClickPopperProps } from '../ClickPopper/ClickPopper';
import { getClassName } from '../../helpers/getClassName';
import { usePlatform } from '../../hooks/usePlatform';
import './Dropdown.css';

export interface DropdownProps extends HoverPopperProps, ClickPopperProps {
  action?: 'click' | 'hover';
  /**
   * @ignore
   * Можно было бы использовать Omit, но react-docgen-typescript в таком случае выкидывает из документации все свойства наследуемого интерфейса
   * https://github.com/styleguidist/react-docgen-typescript/issues/335
   */
  arrow?: HoverPopperProps['arrow'];
  /**
   * Актуально только для action="hover"
   * Количество миллисекунд, после которых произойдет показ дропдауна
   */
  showDelay?: HoverPopperProps['showDelay'];
  /**
   * Актуально только для action="hover"
   * Количество миллисекунд, после которых произойдет скрытие дропдауна
   */
  hideDelay?: HoverPopperProps['hideDelay'];
  /**
   * @ignore
   */
  arrowClassName?: HoverPopperProps['arrowClassName'];
}

export const Dropdown: React.FC<DropdownProps> = ({ action = 'click', hideDelay, showDelay, ...popperProps }: DropdownProps) => {
  const platform = usePlatform();

  let Component;
  let actionSpecificProps: Partial<DropdownProps> = {};

  switch (action) {
    case 'click':
      Component = ClickPopper;
      break;
    case 'hover':
      actionSpecificProps = { hideDelay, showDelay };
      Component = HoverPopper;
      break;
  }

  return (
    <Component vkuiClass={getClassName('Dropdown', platform)} {...actionSpecificProps} {...popperProps} />
  );
};