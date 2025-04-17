import { createReactBlockSpec } from '@blocknote/react';
import { defaultProps } from '@blocknote/core';
import { Menu } from '@mantine/core';
import { MdCancel, MdCheckCircle, MdError, MdInfo } from 'react-icons/md';

// The types of alerts that users can choose from.
export const alertTypes = [
  {
    title: 'Warning',
    value: 'warning',
    icon: MdError,
    color: '#e69819',
    backgroundColor: {
      light: '#fff6e6',
      dark: '#805d20',
    },
  },
  {
    title: 'Error',
    value: 'error',
    icon: MdCancel,
    color: '#d80d0d',
    backgroundColor: {
      light: '#ffe6e6',
      dark: '#802020',
    },
  },
  {
    title: 'Info',
    value: 'info',
    icon: MdInfo,
    color: '#507aff',
    backgroundColor: {
      light: '#e6ebff',
      dark: '#203380',
    },
  },
  {
    title: 'Success',
    value: 'success',
    icon: MdCheckCircle,
    color: '#0bc10b',
    backgroundColor: {
      light: '#e6ffe6',
      dark: '#208020',
    },
  },
] as const;

// Alert 타입 정의
export type AlertType = 'warning' | 'error' | 'info' | 'success';

// 알림 블록 스펙 생성
export const Alert = createReactBlockSpec(
  {
    type: 'alert' as const,
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: 'warning' as AlertType,
        values: ['warning', 'error', 'info', 'success'] as AlertType[],
      },
    },
    content: 'inline',
  },
  {
    render: function AlertComponent(props) {
      const alertType = alertTypes.find(
        (a) => a.value === props.block.props.type,
      )!;
      const Icon = alertType.icon;

      // Tailwind classes based on alert type
      const alertClasses = {
        warning: 'bg-amber-50 dark:bg-amber-900',
        error: 'bg-red-50 dark:bg-red-900',
        info: 'bg-blue-50 dark:bg-blue-900',
        success: 'bg-green-50 dark:bg-green-900',
      };

      const iconClasses = {
        warning: 'text-amber-500',
        error: 'text-red-600',
        info: 'text-blue-500',
        success: 'text-green-500',
      };

      return (
        <div
          className={`flex justify-center items-center flex-grow rounded min-h-12 p-1 ${alertClasses[props.block.props.type]}`}
        >
          {/* Icon which opens a menu to choose the Alert type */}
          <Menu withinPortal={false}>
            <Menu.Target>
              <div
                className="rounded-2xl flex justify-center items-center mx-3 h-4.5 w-4.5 select-none cursor-pointer"
                contentEditable={false}
              >
                <Icon
                  className={`${iconClasses[props.block.props.type]}`}
                  size={32}
                />
              </div>
            </Menu.Target>
            {/* Dropdown to change the Alert type */}
            <Menu.Dropdown>
              <Menu.Label>Alert Type</Menu.Label>
              <Menu.Divider />
              {alertTypes.map((type) => {
                const ItemIcon = type.icon;
                return (
                  <Menu.Item
                    key={type.value}
                    leftSection={
                      <ItemIcon
                        className={iconClasses[type.value as AlertType]}
                      />
                    }
                    onClick={() =>
                      props.editor.updateBlock(props.block, {
                        type: 'alert',
                        props: { type: type.value },
                      })
                    }
                  >
                    {type.title}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
          {/* Rich text field for user to type in */}
          <div className="flex-grow" ref={props.contentRef} />
        </div>
      );
    },
  },
);
