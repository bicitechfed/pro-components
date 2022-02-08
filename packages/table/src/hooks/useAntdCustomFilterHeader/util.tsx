import React from 'react';
import Field from '@ant-design/pro-field';

const renderSelectDom = () => {};

const enums = new Map([['A', renderSelectDom]]);

export const renderFilterDom = (valueType: string, valueEnum: any) => {
  return <Field text="100" valueType="select" mode="edit" valueEnum={valueEnum} />;
};
