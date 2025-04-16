import React from 'react';
import md5 from 'md5';

const getGravatarUrl = (email, size = 80) => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
};

const Gravatar = ({ email, size, alt, className, style }) => {
  const gravatarUrl = getGravatarUrl(email, size);

  return (
    <img
      src={gravatarUrl}
      alt={alt}
      className={className}
      style={{ width: size, height: size, borderRadius: '50%', ...style }}
    />
  );
};

Gravatar.defaultProps = {
  size: 80,
  alt: 'Gravatar',
  className: '',
  style: {},
};

export default Gravatar;