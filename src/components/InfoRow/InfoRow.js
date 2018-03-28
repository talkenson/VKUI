import React from 'react';
import PropTypes from 'prop-types';
import getClassName from '../../helpers/getClassName';
import classnames from '../../lib/classnames';
import './InfoRow.css';

const baseClassName = getClassName('InfoRow');

const InfoRow = ({ title, className, children, style }) => (
  <div className={classnames(baseClassName, className)} style={style}>
    <div className="InfoRow__title">{title}</div>
    <div>
      {children}
    </div>
  </div>
);

InfoRow.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object
};

export default InfoRow;
