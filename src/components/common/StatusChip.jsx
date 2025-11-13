import React from 'react';
import {
  Chip,
  Box,
} from '@mui/material';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  USER_ROLE_LABELS,
} from '../../utils/constants';

const StatusChip = ({ 
  status, 
  type = 'order', 
  size = 'small', 
  variant = 'filled',
  ...props 
}) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'order':
        return {
          label: ORDER_STATUS_LABELS[status] || status,
          color: ORDER_STATUS_COLORS[status] || '#666',
        };
      case 'priority':
        return {
          label: PRIORITY_LABELS[status] || status,
          color: PRIORITY_COLORS[status] || '#666',
        };
      case 'role':
        return {
          label: USER_ROLE_LABELS[status] || status,
          color: '#1976d2',
        };
      default:
        return {
          label: status,
          color: '#666',
        };
    }
  };

  const { label, color } = getStatusConfig();

  return (
    <Chip
      label={label}
      size={size}
      variant={variant}
      sx={{
        backgroundColor: variant === 'filled' ? color : 'transparent',
        color: variant === 'filled' ? 'white' : color,
        borderColor: variant === 'outlined' ? color : 'transparent',
        fontWeight: 500,
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default StatusChip;